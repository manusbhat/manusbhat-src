[kb_limit: 256000]
[ms_limit: 1000]
[rating: 230]
[creation: 2023-08-21T16:00]

TODO: untested

Mugs and Alice are planning a road trip! They will be riding in the rabbit-mobile, whose gas tank can comfortably fit $1 \le K \le 10^9$. Moreover, the rabbit-mobile has an efficiency of 1 mile per gallon. Their gas tank at the start has $0 \le G \le K$ gallons of gas.


Before the commencement of their journey, the two are located at $x = 0$. Their target is to get to $x = D$, where $1 \le D \le 10^9$. However, the gas they have may not be enough! To help them, there are $1 \le N \le 10^5$ gas stations along the way. The $i$th gas station is located at $1 \le x_i \le 10^9$ and sells one gallon of gas for $1 \le c_i \le 10^6$ dollars. 


Mugs and Alice can use the gas they have to travel to the first gas station, where they can potentially buy as many gallons of gas they need to help them reach the second gas station and so on (note: at a gas station, they may also choose not to buy any gas at all, or they may choose to buy so much it lasts them more than one gas station). Of course, their gas tank must never exceed $K$ gallons of gas.


What is the minimum amount of money Mugs and Alice must spend to reach their destination? 

# Input 

The first line contains the integers $K, G, D,$ and $N$.
The next $N$ lines contain two integers: $x_i$ and $c_i$. It is guaranteed that $1 \le x_1 < x_2 < \ldots < x_N < D$.

# Output

Output one line, the minimum amount of money Mugs and Alice must spend to reach their destination. If it is impossible to reach their destination, output -1. Remember to use `long long` for your output!

# Example

```in
40 15 100 3
10 2
50 3
70 1
```
```out
160
```

In this example, it is optimal to first travel to the first gas station using 10 gallons of gas from the initial tank. Once there, purchase $35$ gallons of gas for $70$ dollars. They now have $40$ gallons of gas total. At the second gas station, they can purchase $20$ gallons of gas for $60$ dollars. Finally, at the third gas station, they can purchase $30$ gallons for $30$ dollars which is enough to reach their destination. This comes to a total of $70 + 60 + 30 = 160$ dollars spent on gas.

# Variations
What happens if the mpg is not 1? What happens if we're not on a number line but instead a graph?


Problem Credits: Manu