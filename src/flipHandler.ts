import { Flip, MyBot } from '../types/autobuy'
import { getConfigProperty } from './configHelper'
import { getFastWindowClicker } from './fastWindowClick'
import { log, printMcChatToConsole } from './logger'
import { clickWindow, getWindowTitle, numberWithThousandsSeparators, sleep } from './utils'

export async function flipHandler(bot: MyBot, flip: Flip) {
    flip.purchaseAt = new Date(flip.purchaseAt)

    if (bot.state) {
        setTimeout(() => {
            flipHandler(bot, flip)
        }, 1100)
        return
    }

    bot.state = 'purchasing'
    const timeout = setTimeout(() => {
        if (bot.state === 'purchasing') {
            log("Resetting 'bot.state === purchasing' lock")
            bot.state = null
            bot.removeAllListeners('windowOpen')
        }
    }, 10000)

    const isBed = flip.purchaseAt.getTime() > Date.now()
    const delayUntilBuyStart = isBed ? flip.purchaseAt.getTime() - Date.now() : getConfigProperty('FLIP_ACTION_DELAY')

    bot.lastViewAuctionCommandForPurchase = `/viewauction ${flip.id}`
    await sleep(delayUntilBuyStart)
    bot.chat(bot.lastViewAuctionCommandForPurchase)

    printMcChatToConsole(
        `§f[§4BAF§f]: §fTrying to purchase flip${isBed ? ' (Bed)' : ''}: ${flip.itemName} §for ${numberWithThousandsSeparators(
            flip.startingBid
        )} coins (Target: ${numberWithThousandsSeparators(flip.target)})`
    )

    if (getConfigProperty('USE_WINDOW_SKIPS')) {
        try {
            const lastWindowId = getFastWindowClicker().getLastWindowId()
            if (isBed) {
                getFastWindowClicker().clickBedPurchase(flip.startingBid, lastWindowId + 1)
            } else {
                getFastWindowClicker().clickPurchase(flip.startingBid, lastWindowId + 1)
            }
            await sleep(getConfigProperty('FLIP_ACTION_DELAY'))
            getFastWindowClicker().clickConfirm(flip.startingBid, flip.itemName, lastWindowId + 2)
            clearTimeout(timeout)
            bot.state = null
        } catch (error) {
            log(`Error in useWindowSkipPurchase: ${error}`)
            clearTimeout(timeout)
            bot.state = null
        }
    } else {
        bot.addListener('windowOpen', async window => {
            const title = getWindowTitle(window)
            if (title.toString().includes('BIN Auction View')) {
                await sleep(getConfigProperty('FLIP_ACTION_DELAY'))
                clickWindow(bot, 31)
            } else if (title.toString().includes('Confirm Purchase')) {
                await sleep(getConfigProperty('FLIP_ACTION_DELAY'))
                clickWindow(bot, 11)
                bot.removeAllListeners('windowOpen')
                bot.state = null
            }
        })
    }
}
