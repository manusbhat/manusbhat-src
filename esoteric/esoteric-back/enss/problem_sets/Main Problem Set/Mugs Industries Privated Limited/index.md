[kb_limit: 256000]
[ms_limit: 1000]
[rating: 150]
[creation: 2023-08-21T16:00]

Mugs is starting a wholesale business, where he has the option to buy certain goods into his inventory, and then later sell them to customers. In particular, he starts off with $0 \le D \le 10^6$ dollars to kick off his business. There are $1 \le G \le 10^5$ goods he can import. The $i$th good can be purchased by Mugs for $1 \le p_i \le 10^6$ dollars, and he can sell it for $1 \le r_i \le 10^6$ dollars. Every day for $1 \le K \le 10^5$ days, Mugs can import one or zero goods into his inventory that he hasn't imported before, then sell one or zero goods from his existing inventory. 

Because the economy is depressed, Mugs cannot obtain any loan, meaning he can only import a good if his current fund is at least $p_i$. For each day in $1 \ldots K$, please print out the maximum amount of funds Mugs can achieve at the end of that day.

# Input

The first line contains $D, G,$ and $K$. 
The next line contains $G$ integers, $p_1, p_2, \ldots, p_G$, specifying the prices of the goods Mugs can import.
The final line also contains $G$ integers, $r_1, r_2, \ldots, r_G$, specifying the prices of the goods Mugs can sell.

# Output

Output $K$ integers on one line, the maximum amount of funds Mugs can achieve at the end of each day.

# Example

```in
4 3 3
4 6 9
7 7 12
```
```out
7 8 8
```

On the first day, Mugs can buy and sell the first good to achieve $7$ dollars. To maximize the output on the second day, he can perform the same operations on day $1$ and on day $2$ buy and sell the second good to achieve $8$ dollars. On the third day, it can be shown that $8$ dollars is also the maximum amount of funds Mugs can achieve.

Problem Credits: Jiaming, inspired by sources.