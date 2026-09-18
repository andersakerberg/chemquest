'use client';
import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MazeGame from '@/components/MazeGame/MazeGame';
import TradingScreen, {
  MarketDrug,
  StashItem,
} from '@/components/TradingScreen';
import GameNotice, {
  GameNoticeData,
  NoticeTone,
} from '@/components/GameNotice';
import ShootoutScreen, { MAX_HP } from '@/components/ShootoutScreen';

const BASE_PRICES = [
  420, 500, 1500, 2000, 10000, 1000, 7000, 15000, 200, 300, 3000, 30,
];

const INITIAL_DRUGS: MarketDrug[] = [
  { name: 'Marijuana', price: 420 },
  { name: 'Svampar', price: 500 },
  { name: 'LSD', price: 1500 },
  { name: 'Opium', price: 2000 },
  { name: 'Heroin', price: 10000 },
  { name: 'Brass', price: 1000 },
  { name: 'Nuke', price: 7000 },
  { name: 'Kokain', price: 15000 },
  { name: 'Tjack', price: 200 },
  { name: 'Meskalin', price: 300 },
  { name: 'Crack', price: 3000 },
  { name: 'Exstacy', price: 30 },
];

let noticeId = 1;

const random = (maxValue: number) => {
  let randscript = -1;
  while (randscript < 1 || randscript > maxValue || isNaN(randscript)) {
    randscript = Math.random() * (maxValue + 1);
  }
  return Math.round(randscript);
};

const Currency = (number: number) => {
  let num = String(Math.round(number));
  if (num.indexOf('.') === -1) {
    num += '.00';
  }
  if (num.indexOf('.') === num.length - 2) {
    num += '0';
  }
  return num;
};

const rollPrices = (prices: MarketDrug[]): MarketDrug[] =>
  prices.map((drug, x) => {
    let price = BASE_PRICES[x];
    if (x === 0 || x === 1 || x === 8 || x === 9) {
      price = BASE_PRICES[x] + random(420);
    } else if (x === 11) {
      price = BASE_PRICES[x] + random(100);
    } else if (x === 10) {
      price = BASE_PRICES[x] + random(12000);
    } else {
      price = BASE_PRICES[x] + random(8000);
    }
    return { ...drug, price };
  });

const KnarkGame: React.FC = () => {
  const { t } = useTranslation();
  const cookieName = 'pip182';
  const drugLabel = (name: string) =>
    t(`drugs.${name}`, { defaultValue: name });
  const setCookie = (name: string, value: number) => {
    localStorage.setItem(name, value.toString());
  };
  const getCookie = (name: string): number => {
    if (typeof localStorage !== 'undefined') {
      const fromLocalStorage = localStorage.getItem(name);
      if (fromLocalStorage) {
        return parseInt(fromLocalStorage, 10);
      }
    }
    return 0;
  };

  const [drugs, setDrugs] = useState<MarketDrug[]>(INITIAL_DRUGS);
  const [cash, setCash] = useState(2500);
  const [daysLeft, setDaysLeft] = useState(32);
  const [yourHp, setYourHp] = useState(MAX_HP);
  const [copHp, setCopHp] = useState(MAX_HP);
  const [firstTime, setFirstTime] = useState(0);
  const [stash, setStash] = useState<StashItem[]>([]);
  const [gameLayer1, setGameLayer1] = useState(true);
  const [gameLayer2, setGameLayer2] = useState(false);
  const [showMazeGame, setShowMazeGame] = useState(false);
  const [pocketCapacity, setPocketCapacity] = useState(100);
  const [init, setInit] = useState(false);
  const [oldScore, setOldScore] = useState(0);
  const [noticeQueue, setNoticeQueue] = useState<GameNoticeData[]>([]);
  const [combatLog, setCombatLog] = useState<string[]>([]);

  const pushNotice = useCallback(
    (
      message: string,
      options?: {
        title?: string;
        tone?: NoticeTone;
        actionLabel?: string;
        onDismiss?: () => void;
      },
    ) => {
      const notice: GameNoticeData = {
        id: noticeId++,
        title: options?.title ?? t('notice.streetNews'),
        message,
        tone: options?.tone ?? 'info',
        actionLabel: options?.actionLabel,
        onDismiss: options?.onDismiss,
      };
      setNoticeQueue((prev) => [...prev, notice]);
    },
    [t],
  );

  const dismissNotice = useCallback(() => {
    setNoticeQueue((prev) => {
      if (prev.length === 0) return prev;
      const [current, ...rest] = prev;
      queueMicrotask(() => current.onDismiss?.());
      return rest;
    });
  }, []);

  const addToStash = (
    current: StashItem[],
    name: string,
    quantity: number,
  ): StashItem[] => {
    if (quantity <= 0) return current;
    const existing = current.find((item) => item.name === name);
    if (existing) {
      return current.map((item) =>
        item.name === name
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      );
    }
    return [...current, { name, quantity }];
  };

  const removeFromStash = (
    current: StashItem[],
    name: string,
    quantity: number,
  ): StashItem[] => {
    return current
      .map((item) =>
        item.name === name
          ? { ...item, quantity: item.quantity - quantity }
          : item,
      )
      .filter((item) => item.quantity > 0);
  };

  const handleBuy = (drugName: string, quantity: number): string | null => {
    const drug = drugs.find((d) => d.name === drugName);
    if (!drug) return t('trade.unknownDrug');

    const qty = Math.floor(Number(quantity));
    if (!Number.isFinite(qty) || qty <= 0) return t('trade.pickBuyQty');

    const cost = drug.price * qty;
    if (cost > cash) return t('trade.notEnoughCash');

    const used = stash.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );
    const free = pocketCapacity - used;
    if (qty > free) return t('trade.notEnoughSpace');

    setCash((c) => c - cost);
    setStash((prev) => addToStash(prev, drugName, qty));
    return null;
  };

  const handleSell = (drugName: string, quantity: number): string | null => {
    const qty = Math.floor(Number(quantity));
    if (!Number.isFinite(qty) || qty <= 0) return t('trade.pickSellQty');

    const held = stash.find((item) => item.name === drugName);
    if (!held) return t('trade.dontHaveThat');
    if (qty > held.quantity) return t('trade.dontHaveThatMany');

    const street = drugs.find((d) => d.name === drugName);
    const price = street?.price ?? 0;

    setCash((c) => c + price * qty);
    setStash((prev) => removeFromStash(prev, drugName, qty));
    return null;
  };

  const beginPoliceFight = () => {
    setGameLayer1(false);
    setGameLayer2(true);
    setShowMazeGame(false);
    setYourHp(MAX_HP);
    setCopHp(MAX_HP);
    setCombatLog([t('shoot.cornered')]);
  };

  const startPoliceEncounter = () => {
    pushNotice(t('notice.raidMessage'), {
      title: t('notice.raidTitle'),
      tone: 'danger',
      actionLabel: t('notice.raidAction'),
      onDismiss: beginPoliceFight,
    });
  };

  const randomevent = () => {
    const forcePoliceEveryDay = false; // testing — set true to force police every day
    const x = random(3);
    if (forcePoliceEveryDay || x === 3) {
      startPoliceEncounter();
      return;
    }
    if (x !== 1) return;

    const xx = random(12);

    if (xx === 5) {
      setCash((current) => {
        let lost = random(2000);
        if (current - lost < 0) lost = current;
        queueMicrotask(() =>
          pushNotice(t('notice.muggingMessage', { amount: Currency(lost) }), {
            title: t('notice.muggingTitle'),
            tone: 'danger',
          }),
        );
        return Math.max(0, current - lost);
      });
      return;
    }

    if (xx === 7) {
      const poo = random(5);
      const i = random(12) - 1;
      const giftName = drugs[i]?.name ?? INITIAL_DRUGS[i].name;
      pushNotice(
        t('notice.freeSampleMessage', {
          qty: poo,
          name: drugLabel(giftName),
        }),
        {
          title: t('notice.freeSampleTitle'),
          tone: 'success',
        },
      );
      setStash((prev) => addToStash(prev, giftName, poo));
      return;
    }

    setDrugs((prev) => {
      const next = prev.map((d) => ({ ...d }));
      let message = '';
      let title = t('notice.marketShift');
      let tone: NoticeTone = 'warn';

      if (xx === 4) {
        message = t('notice.eventLsd');
        next[2].price = 100 + random(35);
      } else if (xx === 2) {
        message = t('notice.eventTjack');
        next[8].price = 1000 + random(500);
      } else if (xx === 3) {
        message = t('notice.eventWeedCheap');
        next[0].price = 10 + random(100);
        tone = 'success';
      } else if (xx === 1) {
        message = t('notice.eventCocaine');
        next[7].price = 25000 + random(12000);
        tone = 'success';
      } else if (xx === 6) {
        message = t('notice.eventWeedSeized');
        next[0].price = 1000 + random(1000);
      } else if (xx === 8) {
        const i = random(12) - 1;
        message = t('notice.eventClearance', {
          name: drugLabel(next[i].name),
        });
        next[i].price = next[i].price / 3;
        tone = 'success';
      } else if (xx === 9) {
        message = t('notice.eventHippies');
        next[0].price = 1000 + random(420);
        next[1].price = 2000 + random(2000);
        tone = 'success';
      } else if (xx === 10) {
        message = t('notice.eventOpium');
        next[3].price = 10000 + random(10000);
      } else if (xx === 11) {
        const i = random(12) - 1;
        message = t('notice.eventSeized', {
          name: drugLabel(next[i].name),
        });
        next[i].price = next[i].price * 2;
      } else if (xx === 12) {
        const i = random(12) - 1;
        message = t('notice.eventBadBatch', {
          name: drugLabel(next[i].name),
        });
        next[i].price = next[i].price / 4;
        tone = 'success';
      }

      if (message) {
        queueMicrotask(() => pushNotice(message, { title, tone }));
      }
      return next;
    });
  };

  const endRun = (finalCash: number) => {
    const beatRecord = finalCash > oldScore;
    let message = t('notice.runOverMessage', {
      amount: Currency(finalCash),
    });
    if (beatRecord) {
      message += t('notice.newRecord');
      setCookie(cookieName, finalCash);
      setOldScore(finalCash);
    }
    pushNotice(message, {
      title: t('notice.runOverTitle'),
      tone: beatRecord ? 'success' : 'info',
      actionLabel: t('notice.startAgain'),
    });
    setDaysLeft(31);
    setStash([]);
    setCash(2500);
    setPocketCapacity(100);
    setDrugs(rollPrices(INITIAL_DRUGS));
    setFirstTime(0);
  };

  const RefreshSale = () => {
    if (daysLeft <= 0) {
      endRun(cash);
      return;
    }

    setDrugs((prev) => rollPrices(prev));

    if (daysLeft === 1) {
      pushNotice(t('notice.finalDayMessage'), {
        title: t('notice.finalDayTitle'),
        tone: 'warn',
      });
      setFirstTime(0);
    }

    setDaysLeft((d) => d - 1);

    if (firstTime > 0) {
      randomevent();
    } else {
      setFirstTime(1);
    }
  };

  const killCops = () => {
    const heroHit = random(20);
    const nextCopHp = copHp - heroHit;
    setCopHp(nextCopHp);
    setCombatLog((prev) => [
      ...prev,
      t('shoot.youHit', { damage: heroHit }),
    ]);

    if (nextCopHp <= 0) {
      const loot = Math.round(
        random(10000) + (10000 * 2) / 1.52 + random(2000),
      );
      pushNotice(t('notice.shootoutWonMessage', { amount: Currency(loot) }), {
        title: t('notice.shootoutWonTitle'),
        tone: 'success',
      });
      setCash((c) => c + loot);
      setGameLayer1(true);
      setGameLayer2(false);
      setFirstTime(0);
      RefreshSale();
      return;
    }

    const copHit = random(20);
    const nextYourHp = yourHp - copHit;
    setYourHp(nextYourHp);
    setCombatLog((prev) => [
      ...prev,
      t('shoot.copHit', { damage: copHit }),
    ]);

    if (nextYourHp <= 0) {
      pushNotice(t('notice.wastedMessage'), {
        title: t('notice.wastedTitle'),
        tone: 'danger',
        onDismiss: () => endRun(0),
      });
      setGameLayer1(true);
      setGameLayer2(false);
      setFirstTime(0);
    }
  };

  const runAway = () => {
    setGameLayer2(false);
    setGameLayer1(false);
    setShowMazeGame(true);
  };

  const onMazeEscape = () => {
    pushNotice(t('notice.escapedMessage'), {
      title: t('notice.escapedTitle'),
      tone: 'success',
    });
    setShowMazeGame(false);
    setGameLayer1(true);
    setGameLayer2(false);
  };

  const onMazeCaught = () => {
    pushNotice(t('notice.caughtMessage'), {
      title: t('notice.caughtTitle'),
      tone: 'danger',
    });
    setShowMazeGame(false);
    setGameLayer1(true);
    setGameLayer2(false);
    setStash([]);
    setCash(2500);
    setPocketCapacity(100);
    setDaysLeft(31);
    setFirstTime(0);
  };

  useEffect(() => {
    const savedRecord = getCookie(cookieName);
    setOldScore(savedRecord);
    if (!init) {
      setDrugs(rollPrices(INITIAL_DRUGS));
      setDaysLeft((d) => d - 1);
      setFirstTime(1);
      setInit(true);
    }
  }, []);

  const activeNotice = noticeQueue[0] ?? null;

  return (
    <>
      <GameNotice notice={activeNotice} onClose={dismissNotice} />
      {showMazeGame && (
        <MazeGame onEscape={onMazeEscape} onCaught={onMazeCaught} />
      )}
      {gameLayer2 && !showMazeGame && (
        <ShootoutScreen
          yourHp={yourHp}
          copHp={copHp}
          combatLog={combatLog}
          onFire={killCops}
          onRun={runAway}
        />
      )}
      {gameLayer1 && !showMazeGame && (
        <TradingScreen
          drugs={drugs}
          stash={stash}
          cash={cash}
          daysLeft={daysLeft}
          pocketCapacity={pocketCapacity}
          record={oldScore}
          onBuy={handleBuy}
          onSell={handleSell}
          onNextDay={RefreshSale}
        />
      )}
    </>
  );
};

export default KnarkGame;
