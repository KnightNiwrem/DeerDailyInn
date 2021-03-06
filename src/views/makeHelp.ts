const makeHelp = () => `Here are the currently available commands:
/auth [authorization code] - Completes registration
/authextra [secret string] [authorization code] - Grants additional \
permission to Deer Daily Inn
/balance - Fetches gold balance in Deer Daily Inn
/buy [item code] [quantity] [max price] - Create a buy order
/cancel [item code] - Cancels active buy orders for that item
/coffee - Purchases a cup of coffee for 10 gold
/confirm [confirmation code] - Completes gold deposit
/deals (optional item name) - Displays your recent sales and purchases
/deposit [number of pouches] - Deposits gold into personal Deer Daily \
Inn balance
/help - Display this help message
/info - Displays channel and user info
/inspect [item code] [price] - Displays the buy order quantity waiting \
to purchase this item at that price
/purchases (optional item name) - Displays your recent purchases
/notify - Toggles notification setting for sales on the exchange
/orders - Displays your current active orders
/sales (optional item name) - Displays your recent sales
/start - Gets authorization code from @chtwrsbot for registration
/status - Displays current, future and past statuses
/withdraw [number of pouches] - Withdraws gold from personal Deer Daily \
Inn balance
/wtb [item code] [quantity] [price] - Executes an immediate exact price \
wtb command`;

export { makeHelp };
