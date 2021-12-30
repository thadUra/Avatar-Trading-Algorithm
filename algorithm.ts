###____________AVATAR FUTURES AGLORITHM BY THADDY____________###
def profitLoss = FloatingPL();
input amountForMesFutures = 5;
input amountForEsFutures = 1;
##if profitLoss < 5000 then 1 else if profitLoss >= 5000 and profitLoss < 8000 then 2 else 3;
def positionSize = if GetSymbol() == "/ES:XCME" then amountForEsFutures else amountForMesFutures;
input limitToMarketHours = yes;
def marketHours = if SecondsFromTime(0930) >= 0 and SecondsTillTime(1600) >= 0 then yes else no;



#____________WATER FIRE MOMENTUM____________#
def bbUpper = BollingerBands(close, 0, 20, -2.0, 2.0).UpperBand;
def bbLower = BollingerBands(close, 0, 20, -2.0, 2.0).LowerBand;
def bbMid = BollingerBands(close, 0, 20, -2.0, 2.0).MidLine;
def macLineFast = MACD(3, 10, 16).Value;
def macAvgFast = MACD(3, 10, 16).Avg;
def macLineSlow = MACD(10, 26, 9).Value;
def macAvgSlow = MACD(10, 26, 9).Avg;
plot smat = SimpleMovingAvg(close, 20);
def e1 = (Highest(high, 20) + Lowest(low, 20)) / 2 + SimpleMovingAvg(close, 20);
def e2 = close - (e1 / 2);
def osc = Inertia(close - (e1 / 2), 20);
def ttmS = TTM_Squeeze(close, 20, 1.5, 2.0, 1.0).Histogram;
# Momentum Criteria
def ttmSqueezeSmoothMomentum = osc + smat;
#def ttmSqueezeSmoothMomentum = WildersAverage((ttmS / close) * (if (close > 500 and close < 1500) then 2 * close / 500 else if (close > 1500) then (3 * close / 500) else if (close <= 500 and close > 100) then close / 100 else if (close <= 100 and close > 25) then close / 100 else 0.1) + smat, 2);
def bbSmoothMomentum = WildersAverage(if close >= bbMid then ((close + bbUpper) / 2 + ttmSqueezeSmoothMomentum) / 2 else (ttmSqueezeSmoothMomentum + (close + bbLower) / 2) / 2, 3);
def macdSmoothMomentum = WildersAverage(1.5 * (macLineFast - macAvgFast + macLineSlow - macAvgSlow) / 2 + bbSmoothMomentum, 2);
plot momentum = ((ttmSqueezeSmoothMomentum * 3) + (macdSmoothMomentum * 2) + bbSmoothMomentum) / 6;
momentum.AssignValueColor(Color.WHITE);



#____________EARTH AIR TREND ALGORITHM____________#
def atrState = ATRTrailingStop(trailtype = "modified", atrperiod = 9, atrfactor = 2.9, firsttrade = "long", averagetype = "EXPONENTIAL").state;
def atr = ATRTrailingStop(trailtype = "modified", atrperiod = 9, atrfactor = 2.9, firsttrade = "long", averagetype = "EXPONENTIAL");
plot smaf = SimpleMovingAvg(close, 50, 0, no);
def smath = SimpleMovingAvg(close, 30);
def smatw = SimpleMovingAvg(close, 20);
plot smao = SimpleMovingAvg(close, 100);
def slowMACD = MACD(12, 26, 9).Avg;
# Candle Color Coding
def candleTrend = if atrState == 1 and smaf <= close and smath <= close and smatw <= close then 1 else if atrState == 2 and smaf >= close and smath >= close and smatw >= close then -1 else 0;
AssignPriceColor( if candleTrend == 1 then Color.WHITE else if candleTrend == -1 then Color.DARK_GREEN else Color.YELLOW);
# Darvas Box Trends
def dbUpper = DarvasBox().UpperBand;
def dbLower = DarvasBox().LowerBand;
def dbBullBear = fold index = 1 to 1000 with p = 0 while p == 0 do if dbUpper != dbUpper[index] then if dbUpper > dbUpper[index] and dbLower < dbLower[index] then 2 else if dbUpper > dbUpper[index] and dbLower > dbLower[index] then 1 else if dbUpper[index] > dbUpper and dbLower[index] > dbLower then -1 else 0 else 0;
# Moving Average Ribbon
AddCloud (smat, smaf , CreateColor(0, 166, 255), CreateColor(255, 110, 110));
AddCloud (smaf, smao , CreateColor(0, 102, 255), CreateColor(255, 38, 38));
AddCloud (momentum, smat, CreateColor(0, 225, 255), CreateColor(255, 150, 150));
smat.AssignValueColor(Color.WHITE);
smaf.AssignValueColor(Color.WHITE);
smao.AssignValueColor(Color.WHITE);



#____________ALGORITHM STRATEGY____________#
# Criteria and Other Conditions
def momentumCriteria = if momentum > smat then 1 else -1;
def candleCriteria = candleTrend;
def darvasCriteria = if dbBullBear == 1 then 1 else if dbBullBear == -1 then -1 else 0;
def trendCriteria =  if slowMACD >= 0 then 1 else -1;
def totalCriteria = momentumCriteria + candleCriteria + darvasCriteria + trendCriteria;
def tradeFactor = if SecondsFromTime(0930) >= 0 and SecondsFromTime(0930) <= 23400 then 4 else 2.5;
def lastCandleOne = if close[1] > open[1] then 1 else if close[1] < open[1] then -1 else 0;
def lastCandleTwo =  if close[2] > open[2] then 1 else if close[2] < open[2] then -1 else 0;
def lastCandleThree =  if close[3] > open[3] then 1 else if close[3] < open[3] then -1 else 0;
def lastCandleFour =  if close[4] > open[4] then 1 else if close[4] < open[4] then -1 else 0;
def lastFourCandles = lastCandleOne + lastCandleTwo + lastCandleThree + lastCandleFour;
def EOD = if SecondsTillTime(1655) <= 299 and SecondsTillTime(1655) >= -600 then 1 else 0;
def buyLong = if candleCriteria[1] == 1 and candleCriteria[2] == 1 and candleCriteria[3] == 1 and candleCriteria[4] == 1 and candleCriteria[5] == 0 and candleCriteria[6] == 0 and candleCriteria[7] == 0 and lastFourCandles >= 2 and close[1] > close[4] and !EOD and !EOD[1] then open else 0;
def buyShort = if candleCriteria[1] == -1 and candleCriteria[2] == -1 and candleCriteria[3] == -1 and candleCriteria[4] == -1 and candleCriteria[5] == 0 and candleCriteria[6] == 0 and candleCriteria[7] == 0 and lastFourCandles <= -2 and !EOD and !EOD[1] then open else 0;
def trendChangeFromLong = if (candleCriteria[1] == -1 and candleCriteria[2] == -1 and candleCriteria[3] == -1 and candleCriteria[4] == -1 and candleCriteria[5] == 0 and candleCriteria[6] == 0 and candleCriteria[7] == 0 and close < smao) then close else 0;
# Order Placing
AddOrder(OrderType.BUY_TO_OPEN, buyLong[-1] && (!limitToMarketHours or (limitToMarketHours and marketHours)), close, positionSize, Color.YELLOW, Color.YELLOW);
Alert(buyLong[0] && (!limitToMarketHours or (limitToMarketHours and marketHours)), "Algorithm to buyLong on /ES! @ " + open, Alert.ONCE, Sound.Ding);
#AddOrder(OrderType.SELL_TO_OPEN, buyShort[-1], close, 1, Color.YELLOW, Color.YELLOW, "Sell to Open @ " + close);
# Profit Taking and Stop Losses
def takeLongProfit = fold ip = -1 to 1000 with tp = 0 while tp == 0 do if buyLong[ip] then open[ip] + (tradeFactor * totalCriteria / 4) - 0.25 else 0;
def takeLongProfitConditions = if high > takeLongProfit and takeLongProfit - close <= 0.5 and takeLongProfit - close >= 0 and candleCriteria == 1 then 1 else if high > takeLongProfit and takeLongProfit - close < 0.25 and takeLongProfit - close >= 0 and candleCriteria == 0 then 1 else 0;
def stopLossLong = fold is = -1 to 1000 with sl = 0 while sl == 0 do if buyLong[is] then open[is] - 15 else if buyShort and close < smao then close else if trendChangeFromLong then close else 0;

#def takeShortProfit = fold isp = -1 to 1000 with tsp = 0 while tsp == 0 do if buyShort[isp] then open[isp] + (tradeFactor * totalCriteria / 4) + 0.25 else 0;
#def stopLossShort = fold iss = -1 to 1000 with ss = 0 while ss == 0 do if buyShort[iss] then open[iss]+15 else 0;

#AddOrder(OrderType.BUY_TO_CLOSE, close <= takeShortProfit, close, 1, Color.GREEN, Color.GREEN, "Order filled @ " + close);
#AddOrder(OrderType.BUY_TO_CLOSE, close >= stopLossShort, close, 1, Color.RED, Color.RED,  "Stop filled @ " + close);

AddOrder(OrderType.SELL_TO_CLOSE, close >= takeLongProfit or takeLongProfitConditions, close, positionSize, Color.GREEN, Color.GREEN);
AddOrder(OrderType.SELL_TO_CLOSE, close <= stopLossLong, stopLossLong, positionSize, Color.RED, Color.RED);
AddOrder(OrderType.SELL_TO_CLOSE, EOD[-1], close, positionSize, Color.YELLOW, Color.YELLOW);
Alert(close >= takeLongProfit or takeLongProfitConditions or close <= stopLossLong, "Algorithm to close buyLong position on /ES! @ " + open, Alert.ONCE, Sound.Ding);
# Labels and Visual Indicators for Orders
AddLabel(yes, "Momentum: " + momentumCriteria, if momentumCriteria == 0 then Color.YELLOW else if momentumCriteria > 0 then Color.GREEN else Color.RED);
AddLabel(yes, "Candles: " + candleCriteria, if candleCriteria == 0 then Color.YELLOW else if candleCriteria > 0 then Color.GREEN else Color.RED);
AddLabel(yes, "Darvas: " + darvasCriteria, if darvasCriteria == 0 then Color.YELLOW else if darvasCriteria > 0 then Color.GREEN else Color.RED);
AddLabel(yes, "Trend: " + trendCriteria, if trendCriteria == 0 then Color.YELLOW else if trendCriteria > 0 then Color.GREEN else Color.RED);
AddLabel(yes, "TP: " + tradeFactor * totalCriteria + "  SL: " + (if tradeFactor * totalCriteria > 0 then -60 else 60), if totalCriteria > 0 then Color.GREEN else if totalCriteria == 0 then Color.YELLOW else Color.RED);
