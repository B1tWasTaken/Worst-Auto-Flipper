import { Flip, MyBot } from '../types/autobuy';
import { getConfigProperty } from './configHelper';
import { getFastWindowClicker } from './fastWindowClick';
import { log, printMcChatToConsole } from './logger';
import { clickWindow, getWindowTitle, numberWithThousandsSeparators, sleep } from './utils';

export async function flipHandler(bot: MyBot, flip: Flip) {
    flip.purchaseAt = new Date(flip.purchaseAt);

    if (bot.state) {
        setTimeout(() => {
            flipHandler(bot, flip);
        }, 1100);
        return;
    }
    bot.state = 'purchasing';
    let timeout = setTimeout(() => {
        if (bot.state === 'purchasing') {
            log("Resetting 'bot.state === purchasing' lock");
            bot.state = null;
            bot.removeAllListeners('windowOpen');
        }
    }, 10000);
    let isBed = flip.purchaseAt.getTime() > new Date().getTime();
    bot.lastViewAuctionCommandForPurchase = `/viewauction ${flip.id}`;
    bot.chat(bot.lastViewAuctionCommandForPurchase);
    printMcChatToConsole(
        `§f[§4BAF§f]: §fTrying to purchase flip${isBed ? ' (Bed)' : ''}: ${flip.itemName} §for ${numberWithThousandsSeparators(
            flip.startingBid
        )} coins (Target: ${numberWithThousandsSeparators(flip.target)})`
    );
    if (getConfigProperty('USE_WINDOW_SKIPS')) {
        useWindowSkipPurchase(flip, isBed);
        setTimeout(() => {
            bot.state = null;
            clearTimeout(timeout);
        }, 2500);
    }
    if (isBed) {
        printMcChatToConsole('DEBUG: Attempting to spam the Bed')
        bot.addListener('windowOpen', async (window) => {
            while (true) {
                let title = getWindowTitle(window);
                clickWindow(bot, 31);
                if (title.toString().includes('Confirm Purchase')) {
                    clickWindow(bot, 11);
                    bot.removeAllListeners('windowOpen');
                    bot.state = null;
                    return;
                }
                if (!(title.toString().includes('Confirm Purchase')) || (title.toString().includes('BIN Auction View'))) {
                    bot.removeAllListeners('windowOpen');
                    bot.state = null;
                    return;
                }
                await sleep(200);
            }
        });
    } else {
        useRegularPurchase(bot);
    }
}

async function useRegularPurchase(bot: MyBot) {
    bot.addListener('windowOpen', async (window) => {
        let title = getWindowTitle(window);
        if (title.toString().includes('BIN Auction View')) {
            await sleep(getConfigProperty('FLIP_ACTION_DELAY'));
            clickWindow(bot, 31);
        }
        if (title.toString().includes('Confirm Purchase')) {
            await sleep(getConfigProperty('FLIP_ACTION_DELAY'));
            clickWindow(bot, 11);
            bot.removeAllListeners('windowOpen');
            bot.state = null;
            return;
        }
    });
}

async function useWindowSkipPurchase(flip: Flip, isBed: boolean) {
    // bans you so removing it alltogether :p
}

