import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface MarketDrug {
  name: string;
  price: number;
}

export interface StashItem {
  name: string;
  quantity: number;
}

interface TradingScreenProps {
  drugs: MarketDrug[];
  stash: StashItem[];
  cash: number;
  daysLeft: number;
  pocketCapacity: number;
  record: number;
  onBuy: (drugName: string, quantity: number) => string | null;
  onSell: (drugName: string, quantity: number) => string | null;
  onNextDay: () => void;
}

const formatMoney = (value: number) =>
  `$${Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

const QtyControls: React.FC<{
  value: number;
  max: number;
  onChange: (next: number) => void;
  maxLabel: string;
  decLabel: string;
  incLabel: string;
}> = ({ value, max, onChange, maxLabel, decLabel, incLabel }) => {
  const clampedMax = Math.max(0, max);
  return (
    <div className="tradeQty">
      <button
        type="button"
        className="tradeQtyBtn"
        disabled={value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        aria-label={decLabel}
      >
        −
      </button>
      <input
        className="tradeQtyInput"
        type="number"
        min={0}
        max={clampedMax}
        value={value}
        onChange={(e) => {
          const parsed = parseInt(e.target.value, 10);
          if (Number.isNaN(parsed)) {
            onChange(0);
            return;
          }
          onChange(Math.max(0, Math.min(clampedMax, parsed)));
        }}
      />
      <button
        type="button"
        className="tradeQtyBtn"
        disabled={value >= clampedMax}
        onClick={() => onChange(Math.min(clampedMax, value + 1))}
        aria-label={incLabel}
      >
        +
      </button>
      <button
        type="button"
        className="tradeQtyMax"
        disabled={clampedMax <= 0}
        onClick={() => onChange(clampedMax)}
      >
        {maxLabel}
      </button>
    </div>
  );
};

const TradingScreen: React.FC<TradingScreenProps> = ({
  drugs,
  stash,
  cash,
  daysLeft,
  pocketCapacity,
  record,
  onBuy,
  onSell,
  onNextDay,
}) => {
  const { t } = useTranslation();
  const [buyQty, setBuyQty] = useState<Record<string, number>>({});
  const [sellQty, setSellQty] = useState<Record<string, number>>({});
  const [flash, setFlash] = useState<string | null>(null);

  const drugName = (name: string) => t(`drugs.${name}`, { defaultValue: name });

  const pocketUsed = useMemo(
    () => stash.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [stash],
  );
  const pocketFree = Math.max(0, pocketCapacity - pocketUsed);
  const pocketPct =
    pocketCapacity > 0
      ? Math.min(100, Math.round((pocketUsed / pocketCapacity) * 100))
      : 0;

  const ownedByName = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of stash) map[item.name] = item.quantity;
    return map;
  }, [stash]);

  const marketPriceByName = useMemo(() => {
    const map: Record<string, number> = {};
    for (const drug of drugs) map[drug.name] = drug.price;
    return map;
  }, [drugs]);

  const showFlash = (message: string | null) => {
    if (!message) return;
    setFlash(message);
    window.setTimeout(() => setFlash(null), 2200);
  };

  const maxBuyFor = (price: number) => {
    if (price <= 0) return pocketFree;
    return Math.min(pocketFree, Math.floor(cash / price));
  };

  const handleBuy = (name: string) => {
    const qty = buyQty[name] ?? 0;
    if (qty <= 0) {
      showFlash(t('trade.pickBuyQty'));
      return;
    }
    const error = onBuy(name, qty);
    if (error) {
      showFlash(error);
      return;
    }
    setBuyQty((prev) => ({ ...prev, [name]: 0 }));
    showFlash(t('trade.bought', { qty, name: drugName(name) }));
  };

  const handleSell = (name: string, owned: number) => {
    const qty = sellQty[name] ?? 0;
    if (qty <= 0) {
      showFlash(t('trade.pickSellQty'));
      return;
    }
    if (qty > owned) {
      showFlash(t('trade.dontHaveThatMany'));
      return;
    }
    const error = onSell(name, qty);
    if (error) {
      showFlash(error);
      return;
    }
    setSellQty((prev) => ({ ...prev, [name]: 0 }));
    showFlash(t('trade.sold', { qty, name: drugName(name) }));
  };

  return (
    <div className="tradeScreen">
      <header className="tradeHeader">
        <img
          className="tradeLogo"
          src="/chemquest/text.gif"
          alt={t('trade.logoAlt')}
        />
        <div className="tradeStats">
          <div className="tradeStat">
            <span className="tradeStatLabel">{t('trade.cash')}</span>
            <span className="tradeStatValue tradeCash">{formatMoney(cash)}</span>
          </div>
          <div className="tradeStat">
            <span className="tradeStatLabel">{t('trade.spaceLeft')}</span>
            <span className="tradeStatValue">
              {pocketFree}
              <span className="tradeStatSuffix">/{pocketCapacity}</span>
            </span>
          </div>
          <div className="tradeStat">
            <span className="tradeStatLabel">{t('trade.daysLeft')}</span>
            <span className="tradeStatValue">{daysLeft}</span>
          </div>
          <div className="tradeStat">
            <span className="tradeStatLabel">{t('trade.best')}</span>
            <span className="tradeStatValue">{formatMoney(record)}</span>
          </div>
        </div>
        <div className="tradePocket">
          <div className="tradePocketTop">
            <span>{t('trade.pocketSpace')}</span>
            <strong>
              {t('trade.pocketStatus', { free: pocketFree, used: pocketUsed })}
            </strong>
          </div>
          <div className="tradePocketBar" aria-hidden="true">
            <div
              className="tradePocketFill"
              style={{ width: `${pocketPct}%` }}
            />
          </div>
        </div>
      </header>

      {flash && <div className="tradeFlash">{flash}</div>}

      <section className="tradePanel">
        <div className="tradePanelHead">
          <h2>{t('trade.streetPrices')}</h2>
          <p>{t('trade.streetPricesHint')}</p>
        </div>
        <ul className="tradeList">
          {drugs.map((drug) => {
            const maxQty = maxBuyFor(drug.price);
            const qty = Math.min(buyQty[drug.name] ?? 0, maxQty);
            const total = qty * drug.price;
            const owned = ownedByName[drug.name] ?? 0;
            return (
              <li key={drug.name} className="tradeRow">
                <div className="tradeRowMain">
                  <span className="tradeName">
                    {drugName(drug.name)}
                    {owned > 0 && (
                      <span className="tradeOwned">
                        {t('trade.have', { count: owned })}
                      </span>
                    )}
                  </span>
                  <span className="tradePrice">{formatMoney(drug.price)}</span>
                </div>
                <div className="tradeRowActions">
                  <QtyControls
                    value={qty}
                    max={maxQty}
                    maxLabel={t('trade.max')}
                    decLabel={t('trade.decreaseQty')}
                    incLabel={t('trade.increaseQty')}
                    onChange={(next) =>
                      setBuyQty((prev) => ({ ...prev, [drug.name]: next }))
                    }
                  />
                  <button
                    type="button"
                    className="tradeActionBtn tradeBuyBtn"
                    disabled={qty <= 0 || maxQty <= 0}
                    onClick={() => handleBuy(drug.name)}
                  >
                    {qty > 0
                      ? t('trade.buyFor', { amount: formatMoney(total) })
                      : t('trade.buy')}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="tradePanel">
        <div className="tradePanelHead">
          <h2>{t('trade.yourStash')}</h2>
          <p>{t('trade.stashHint')}</p>
        </div>
        {stash.length === 0 ? (
          <p className="tradeEmpty">{t('trade.stashEmpty')}</p>
        ) : (
          <ul className="tradeList">
            {stash.map((item) => {
              const streetPrice = marketPriceByName[item.name] ?? 0;
              const maxQty = item.quantity;
              const qty = Math.min(sellQty[item.name] ?? 0, maxQty);
              const total = qty * streetPrice;
              return (
                <li key={item.name} className="tradeRow">
                  <div className="tradeRowMain">
                    <span className="tradeName">
                      {drugName(item.name)}
                      <span className="tradeOwned">
                        {t('trade.have', { count: item.quantity })}
                      </span>
                    </span>
                    <span className="tradePrice">
                      {t('trade.sellAt', { amount: formatMoney(streetPrice) })}
                    </span>
                  </div>
                  <div className="tradeRowActions">
                    <QtyControls
                      value={qty}
                      max={maxQty}
                      maxLabel={t('trade.max')}
                      decLabel={t('trade.decreaseQty')}
                      incLabel={t('trade.increaseQty')}
                      onChange={(next) =>
                        setSellQty((prev) => ({ ...prev, [item.name]: next }))
                      }
                    />
                    <button
                      type="button"
                      className="tradeActionBtn tradeSellBtn"
                      disabled={qty <= 0}
                      onClick={() => handleSell(item.name, item.quantity)}
                    >
                      {qty > 0
                        ? t('trade.sellFor', { amount: formatMoney(total) })
                        : t('trade.sell')}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="tradeFooter">
        <button type="button" className="tradeNextDay" onClick={onNextDay}>
          {t('trade.nextDay')}
        </button>
      </footer>
    </div>
  );
};

export default TradingScreen;
