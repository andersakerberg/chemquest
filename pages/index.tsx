'use client';
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useRouter } from 'next/router';

interface KillForm {
  copText: { value: string };
  yourHp: { value: number };
  copsHp: { value: number };
}

interface Drug {
  name: string;
  price: number;
  quantity: number;
}

const KnarkGame: React.FC = () => {
  const router = useRouter();
  const showMazeGame = router.query.mupp;
  const cookieName = 'pip182';
  const setCookie = (name: string, value: number) => {
    localStorage.setItem(name, value.toString());
  };
  const setprices = [
    420, 500, 1500, 2000, 10000, 1000, 7000, 15000, 200, 300, 3000, 30,
  ];
  const getCookie = (name: string): number => {
    if (localStorage) {
      const fromLocalStorage = localStorage.getItem(name);
      if (fromLocalStorage) {
        return parseInt(fromLocalStorage);
      }
    }
    return 0;
  };
  //@ts-ignore
  const [drugs, setDrugs] = useState<Drug[]>([
    { name: 'Marijuana', price: 420, quantity: 0 },
    { name: 'Svampar', price: 500, quantity: 0 },
    { name: 'LSD', price: 1500, quantity: 0 },
    { name: 'Opium', price: 2000, quantity: 0 },
    { name: 'Heroin', price: 10000, quantity: 0 },
    { name: 'Brass', price: 1000, quantity: 0 },
    { name: 'Nuke', price: 7000, quantity: 0 },
    { name: 'Kokain', price: 15000, quantity: 0 },
    { name: 'Tjack', price: 200, quantity: 0 },
    { name: 'Meskalin', price: 300, quantity: 0 },
    { name: 'Crack', price: 3000, quantity: 0 },
    { name: 'Exstacy', price: 30, quantity: 0 },
  ]);

  const RefreshSale = () => {
    clearSelections();
    for (let x = 0; x < 12; x++) {
      let currentDrug = drugs[x];
      if (x == 0 || x == 1 || x == 8 || x == 9) {
        currentDrug.price = setprices[x] + random(420);
      } else if (x == 11) {
        currentDrug.price = setprices[x] + random(100);
      } else if (x == 10) {
        currentDrug.price = setprices[x] + random(12000);
      } else {
        currentDrug.price = setprices[x] + random(8000);
      }
    }
    if (firstTime > 0) randomevent();
    else setFirstTime(1);
    setDaysLeft((daysLeft) => daysLeft - 1);
    if (daysLeft == 1) {
      alert('Det här är din sista dag!');
      setFirstTime(0);
    }
    if (daysLeft <= 0) {
      alert(
        'Du har fixat ' +
          Currency(cash) +
          ' genom att sälja knark,  nu är bin Ladin stolt över dig.',
      );
      setDaysLeft(31);
      for (let x = 0; x < 12; x++) {
        let currentDrug = drugs[x];
        if (x == 0 || x == 1 || x == 8 || x == 9) {
          currentDrug.price = setprices[x] + random(420);
        } else if (x == 10 || x == 11) {
          currentDrug.price = setprices[x] + random(100);
        } else {
          currentDrug.price = setprices[x] + random(5000);
        }
      }
      for (let x = 0; x < 12; x++) {
        setYourDrugs([]);
      }
      if (oldScore !== undefined && cash > oldScore) {
        alert('GRATTIS!! Du har slagit ditt eget rekord!!');
        setCookie(cookieName, cash);
        setOldScore(cash);
      }
      setCash(2500);
      setSLeft(0);
      setSAvail(100);
    }
  };

  const [cash, setCash] = useState(2500);
  const [daysLeft, setDaysLeft] = useState(32);
  const [yourHp, setYourHp] = useState(50);
  const [copHp, setCopHp] = useState(50);
  const [firstTime, setFirstTime] = useState(0);
  const [yourdrugs, setYourDrugs] = useState<Drug[]>([]);
  const [gameLayer1, setGameLayer1] = useState(true);
  const [gameLayer2, setGameLayer2] = useState(false);
  const [sAvail, setSAvail] = useState(100);
  const [sLeft, setSLeft] = useState(0);
  const [init, setInit] = useState(false);
  const [selectedDrugToBuy, setSelectedDrugToBuy] = useState(-1);
  const [selectedDrugToSell, setSelectedDrugToSell] = useState(-1);

  const [oldScore, setOldScore] = useState(0);

  const [killForm, setKillForm] = useState<KillForm>({
    copText: { value: '' },
    yourHp: { value: 0 },
    copsHp: { value: 0 },
  });

  useEffect(() => {
    const savedRecord = getCookie(cookieName);
    setOldScore(savedRecord!);
    if (!init) {
      RefreshSale();
      setInit(true);
    }
  }, []);

  const clearSelections = () => {
    setSelectedDrugToBuy(-1);
    setSelectedDrugToSell(-1);
  };

  const killCops = () => {
    let hit = random(20);
    setCopHp(copHp - hit);
    killForm.copText.value = 'Du orsakade ' + hit + ' kulhål.';
    if (refreshCops() === 2) {
      hit = Math.round(random(10000) + (10000 * 2) / 1.52 + random(2000));
      alert('Du mördade snuten och tjänade ' + Currency(hit) + ' på det!');
      setCash(cash + hit);
      setGameLayer1(true);
      setGameLayer2(false);
      setFirstTime(0);
      RefreshSale();
      return;
    }
    hit = random(20);
    setYourHp(yourHp - hit);
    killForm.copText.value =
      killForm.copText.value +
      '\n\nBången orsakade ' +
      hit +
      ' kulhål på dig!!';
    if (refreshCops() === 1) {
      alert('Du fick käka bly, DU ÄR TOT MAL!!');
      setDaysLeft(0);
      setGameLayer1(true);
      setGameLayer2(false);
      setFirstTime(0);
      RefreshSale();
    }
  };

  const refreshCops = () => {
    let tempKillForm: KillForm = {
      copText: { value: '' },
      yourHp: { value: 0 },
      copsHp: { value: 0 },
    };
    Object.assign(killForm, tempKillForm);
    tempKillForm.yourHp.value = yourHp;
    tempKillForm.copsHp.value = copHp;

    setKillForm(tempKillForm);

    if (yourHp <= 0) {
      return 1;
    }
    if (copHp <= 0) {
      return 2;
    }

    return;
  };

  const runAway = () => {
    let run = random(2);
    if (run === 1) {
      alert('Du lyckades fly.');
      setGameLayer1(true);
      setGameLayer2(false);
      return;
    }
    if (run === 2) {
      alert('Det gick inte, försök igen eller slåss som en man.');
      let hit = random(20);
      setYourHp(yourHp - hit);
      killForm.copText.value = 'Bången orsakade ' + hit + ' kulhål på dig.';
      if (refreshCops() === 1) {
        alert('Bången spöade skiten ur dig!!');
        setDaysLeft(0);
        setGameLayer1(true);
        setGameLayer2(false);
        RefreshSale();
      }
    }
  };

  const random = (maxValue: number) => {
    let randscript = -1;
    while (randscript < 1 || randscript > maxValue || isNaN(randscript)) {
      randscript = Math.random() * (maxValue + 1);
    }
    return Math.round(randscript);
  };

  const Currency = (number: number) => {
    let num = new String(Math.round(number));
    if (num.indexOf('.') === -1) {
      num += '.00';
    }
    if (num.indexOf('.') === num.length - 2) {
      num += '0';
    }
    return num;
  };

  const calcmax = (p: number) => {
    console.log(`Incoming price for the drug is ${p}`);
    let mp;
    let max = sAvail - sLeft;
    console.log(`Max total diregarding prics is ${max}`);
    for (let x = 0; x <= max; x++) {
      mp = p * x;
      if (mp >= cash || x == max || p * (x + 1) > cash) {
        return Math.round(x);
      }
    }
    return 0;
  };

  const randomevent = () => {
    let x = random(3);
    if (x === 3 && !firstTime) {
      alert('Bången är här, det blir skottlossning!');
      setGameLayer1(false);
      setGameLayer2(true);
      killForm.copText.value = '';
      setYourHp(50);
      setCopHp(50);
      refreshCops();
    }
    if (x === 1) {
      let xx = random(12);
      if (xx === 4) {
        alert('Salvation army is handing out LSD, prices are plummeting!!');
        drugs[2].price = 100 + random(35);
      }
      if (xx === 2) {
        alert('The homeless are desperate and buying Tjack for a lot of money.');
        drugs[8].price = 1000 + random(500);
      }
      if (xx === 3) {
        alert('Marijuana is very cheap right now.');
        drugs[0].price = 10 + random(100);
      }
      if (xx === 5) {
        let lost = random(2000);
        if (cash - lost < 0) lost = cash;
        alert('You got mugged , you lost $' + Currency(lost));
        setCash(cash - lost);
        if (cash < 0) setCash(0);
      }
      if (xx === 1) {
        alert('Ögan vill ha kokain! Han går gärna till Överpriser.');
        drugs[8].price = 25000 + random(12000);
      }
      if (xx === 6) {
        alert('Bången beslagtar stora mängder Marijuana, priserna höjs.');
        drugs[0].price = 1000 + random(1000);
      }
      if (xx === 7) {
        let poo = random(5);
        let x = random(12) - 1;
        alert('Haschman bjuder dig på lite ' + drugs[x].name + '.');
        if (yourdrugs.find((X) => X?.name == drugs[x].name)) {
          const savedQuantity = yourdrugs[x].quantity;
          yourdrugs[x] = { ...drugs[x] };
          yourdrugs[x].quantity += poo + savedQuantity;
        } else {
          yourdrugs[x] = { ...drugs[x] };
          yourdrugs[x].quantity = poo;
        }

        setCash(cash + drugs[x].price * poo);
        setGameLayer1(true);
        setGameLayer2(false);
      }
      if (xx === 8) {
        let x = random(12) - 1;
        alert('Lagerrensning på ' + drugs[x].name + '.');

        drugs[x].price = drugs[x].price / 3;
      }
      if (xx === 9) {
        alert('Hippies i stan. Marijuana, Svamp, och LSD-priserna är skyhöga!');
        drugs[0].price = 1000 + random(420);
        drugs[1].price = 2000 + random(2000);
        random(2000);
      }
      if (xx === 10) {
        alert('Stort beslag av Opium, priserna är helt sanslösa!!');
        drugs[3].price = 10000 + random(10000);
      }
      if (xx === 11) {
        let x = random(12) - 1;
        alert(
          'Snuten beslagtar mängder av ' +
            drugs[x].name +
            '. Priserna fördubblade!',
        );
        drugs[x].price = drugs[x].price * 2;
      }
      if (xx === 12) {
        let x = random(12) - 1;
        alert('Ful ' + drugs[x].name + ' cirkulerar! Priserna 1/4 av vanliga.');
        drugs[x].price = drugs[x].price / 4;
      }
      if (xx === 14) {
        alert('Inbrott på apoteket, Exstacypriserna låga.');
        drugs[11].price = 1 + random(10);
      }
      if (xx === 15) {
        let x = 500 + random(100);
        let x2 = confirm(
          'Do you want to modify your pouch to hold another 50 drugs for ' +
            Currency(x) +
            '?',
        );
        if (x2 === true && cash >= x) {
          setCash(cash - Number(x));
          setSAvail(sAvail + 50);
        } else if (x2 === true && cash < x) {
          alert('Not enough cash!');
        }
      }
      if (xx === 16) {
        alert('Pounders pay alot of money for some golden brown.');
        drugs[x].price = 20000 + random(20000);
      }
      if (xx === 17 || xx === 13 || xx === 18) {
        alert('Coppers are here, get ready for a shootout!');
        setGameLayer1(false);
        setGameLayer2(true);
        killForm.copText.value = '';
        setYourHp(50);
        setCopHp(50);
        refreshCops();
      }
    }
  };

  const sellit = () => {
    let sel: number = selectedDrugToSell;
    if (sel === -1) {
      alert('Choose a drug first!');
      return;
    }
    let promptInput = prompt(
      'How much of ' + yourdrugs[sel].name + ' do you want to sell?',
      yourdrugs[sel].quantity.toString(),
    );
    if (promptInput === null) return;

    let quantityToSellFromPrompt = parseInt(promptInput);
    if (quantityToSellFromPrompt > 0) {
      if (quantityToSellFromPrompt < 0) {
        alert('No negative numbers you idiot!!');
        return;
      }
      if (quantityToSellFromPrompt === 0) return;
      if (quantityToSellFromPrompt <= yourdrugs[sel].quantity) {
        setCash(cash + drugs[sel].price * quantityToSellFromPrompt);
        calculateSpaceLeft();
        if (yourdrugs[sel].quantity === quantityToSellFromPrompt) {
          yourdrugs.splice(sel, 1);
        } else {
          yourdrugs[sel].quantity =
            yourdrugs[sel].quantity - quantityToSellFromPrompt;
        }
      } else {
        alert('No more room!!!');
        return;
      }
    }
    clearSelections();
  };

  const buyit = () => {
    let sel = selectedDrugToBuy;
    if (sel === -1) {
      alert('Choose a drug first!');
      return;
    }
    let fromPrompt = prompt(
      'How much of ' + drugs[sel].name + ' do you want to buy?',
      calcmax(drugs[sel].price).toString(),
    );
    if (fromPrompt === null) return;

    const quantity = parseInt(fromPrompt!);
    if (quantity < 0) {
      alert('No negative numbers you idiot!!');
      return;
    }
    if (quantity === 0) return;
    if (drugs[sel].price * quantity <= cash && sLeft + quantity <= sAvail) {
      yourdrugs[sel] = { ...drugs[sel] };
      yourdrugs[sel].quantity = quantity;
      setCash(cash - drugs[sel].price * quantity);
      calculateSpaceLeft();
      setGameLayer1(true);
      setGameLayer2(false);
    } else if (quantity > 0 && cash < drugs[sel].price * quantity) {
      alert('Not enough cash!');
      return;
    } else {
      alert('No more room, must try harder on the school report!!');
      return;
    }
    clearSelections();
  };

  const calculateSpaceLeft = () => {
    let totalHeldQuantity = 0;
    for (var drug of yourdrugs) {
      totalHeldQuantity += drug.quantity;
    }

    if (sAvail < totalHeldQuantity) {
      alert(
        'Not enough room the police confiscated all your drugs! You dirty hacker!!',
      );
      setYourDrugs([]);
    } else {
      setSLeft(sAvail - totalHeldQuantity);
    }
  };

  const numberWithCommas = (x: number) => {
    x = Math.round(x);
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <>
      {gameLayer2 && !showMazeGame && (
        <div id="gameLayer2" className="layerClass">
          <form name="killForm">
            <p>Coopers are here!!</p>
            <hr />
            <br />
            <table>
              <tbody>
                <tr>
                  <td width="300" align="left">
                    <p className="b">
                      <b>HERO: </b>
                    </p>
                    <center>
                      <input
                        name="yourHp"
                        type="text"
                        value={yourHp}
                        className="b"
                        readOnly
                      />
                    </center>

                    <center>
                      <img src="/chemquest/hero2.gif" />
                    </center>
                  </td>
                  <td>
                    <textarea name="copText" className="textClass"></textarea>
                  </td>
                  <td width="300" align="right">
                    <p className="b">
                      <b>COP: </b>
                    </p>
                    <center>
                      <input
                        name="copsHp"
                        type="text"
                        value={copHp}
                        className="b"
                        readOnly
                      />
                    </center>

                    <center>
                      <img src="/chemquest/snut2.gif" />
                    </center>
                  </td>
                </tr>
              </tbody>
            </table>
            <br />
            <br />
            <input
              type="button"
              value="Fire the gun!"
              className="copFightAction"
              onClick={killCops}
            />
            <input
              type="button"
              value="Run away"
              className="copFightAction"
              onClick={runAway}
            />
          </form>
        </div>
      )}
      {gameLayer1 && !showMazeGame && (
        <div id="gameLayer1">
          <center>
            <img src="/chemquest/text.gif" />
            <br />
          </center>
          <center>
            <form action="#" name="drugform">
              <p className="impClass">
                <b>Stålar:</b>
              </p>
              <input
                name="money"
                className="selClass"
                type="text"
                value={'$' + cash}
                readOnly
              />
              <br />
              <p className="impClass">Space left: </p>
              <div className="inventoryStatus">
                <input
                  className="coatClass"
                  name="spaceLeft"
                  type="text"
                  value={sLeft}
                  readOnly
                />
                <p>/</p>
                <input
                  className="coatClass"
                  name="spaceAvail"
                  type="text"
                  value={sAvail}
                  readOnly
                />
              </div>
              <table>
                <thead>
                  <tr>
                    <th>
                      <center>
                        <input
                          type="button"
                          className="buttClass"
                          value="Köp"
                          name="buy"
                          onClick={buyit}
                        />
                        <br />
                        <p className="impClass">Drugs for sale:</p>
                        <br />
                      </center>
                    </th>
                    <th>
                      <center>
                        <input
                          type="button"
                          className="buttClass"
                          value="Sälj"
                          name="sell"
                          onClick={sellit}
                        />
                        <br />
                        <p className="impClass">Your drugs:</p>
                        <br />
                      </center>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <center>
                        <table className="drugTable">
                          <thead>
                            <tr>
                              <th className="drugColumn">Drug</th>
                              <th className="drugColumn">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {drugs.map((drug, index) => {
                              let classes = `drugRow`;
                              if (index === selectedDrugToBuy) {
                                classes += ' selectedDrugRow';
                              }
                              return (
                                <tr
                                  onClick={() => {
                                    setSelectedDrugToBuy(index);
                                    setSelectedDrugToSell(-1);
                                  }}
                                  key={index}
                                  className={classes}
                                >
                                  <td className="drugColumn">{drug.name}</td>
                                  <td className="drugColumn">
                                    ${numberWithCommas(drug.price)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </center>
                    </td>
                    <td>
                      <center>
                        <table className="drugTable">
                          <thead>
                            <tr>
                              <th className="drugColumn">Drug</th>
                              <th className="drugColumn">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {yourdrugs.length > 0 &&
                              yourdrugs.map((yourDrug, index) => {
                                let classes = `drugRow`;
                                if (index === selectedDrugToSell) {
                                  classes += ' selectedDrugRow';
                                }
                                return (
                                  <tr
                                    onClick={() => {
                                      setSelectedDrugToBuy(-1);
                                      setSelectedDrugToSell(index);
                                    }}
                                    key={index}
                                    className={classes}
                                  >
                                    <td className="drugColumn">{`${yourDrug.name}(${yourDrug.quantity})`}</td>
                                    <td className="drugColumn">
                                      ${numberWithCommas(yourDrug.price)}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </center>
                    </td>
                  </tr>
                </tbody>
              </table>
              <br />
              <input
                type="button"
                className="buttClass"
                value="Fortsätt"
                name="Done"
                onClick={RefreshSale}
              />
              <br />
              <p className="impClass">Dagar Kvar:</p>
              <input
                name="left"
                className="impClass"
                type="text"
                value={daysLeft}
                readOnly
              />
              <br />
              <br />
              <p className="impClass">Ditt bästa hittills:</p>
              <input
                name="score"
                className="selClass"
                type="text"
                value={oldScore}
                readOnly
              />
            </form>
          </center>
        </div>
      )}
    </>
  );
};

export default KnarkGame;
