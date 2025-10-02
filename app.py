import requests

def get_price(symbol="bitcoin", currency="usd"):
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {
        "ids": symbol,
        "vs_currencies": currency,
        "include_24hr_change": "true"
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        # safe access
        if symbol in data and currency in data[symbol]:
            price = data[symbol][currency]
            change = data[symbol].get(f"{currency}_24h_change", None)
            return price, change
        return None, None
    except Exception as e:
        print("Error fetching", symbol, ":", e)
        return None, None

if __name__ == "__main__":
    coins = ["bitcoin", "ethereum", "solana"]
    for coin in coins:
        price, change = get_price(coin)
        if price is not None:
            change_str = f" (24h: {change:+.2f}%)" if change is not None else ""
            print(f"{coin.capitalize():8} price: ${price:,.6f}{change_str}")
        else:
            print(f"Failed to fetch {coin} price")
