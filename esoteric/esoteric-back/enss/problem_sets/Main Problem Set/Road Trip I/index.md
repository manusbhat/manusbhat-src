[kb_limit: 256000]
[ms_limit: 1000]
[rating: 160]
[creation: 2023-08-14T16:00]

Mugs and Alice are planning a road trip! They will be riding in the rabbit-mobile, whose gas tank has an infinite capacity. Moreover, the rabbit-mobile has an efficiency of 1 mile per gallon. Their gas tank at the start has $0 \le G \le 10^9$ gallons of gas (note: even though the capacity of the gas tank is infinite, it does not start out with infinite gas).


Before the commencement of their journey, the two are located at $x = 0$. Their target is to get to $x = D$, where $1 \le D \le 10^9$. However, the gas they have may not be enough! To help them, there are $1 \le N \le 2.5 \cdot 10^3$ gas stations along the way. The $i$th gas station is located at $1 \le x_i \le 10^9$ and sells one gallon of gas for $1 \le c_i \le 10^4$ dollars. 


Mugs and Alice can use the gas they have to travel to the first gas station, where they can potentially buy as many gallons of gas they need to help them reach the second gas station and so on (note: at a gas station, they may also choose not to buy any gas at all, or they may choose to buy so much it lasts them more than one gas station). 


What is the minimum amount of money Mugs and Alice must spend to reach their destination? 

# Input 

The first line contains the integers $G, D,$ and $N$.
The next $N$ lines contain two integers: $x_i$ and $c_i$. It is guaranteed that $1 < x_1 < x_2 < \ldots < x_N < D$.

# Output

Output one line, the minimum amount of money Mugs and Alice must spend to reach their destination. If it is impossible to reach their destination, output -1. Remember to use `long long` for your output!

# Example

```in
15 100 3
10 2
50 2
70 1
```
```out
140
```

In this example, it is optimal to first travel to the first gas station using 10 gallons of gas from the initial tank. Once there, purchase $55$ gallons of gas for $110$ dollars. They now have $60$ gallons of gas total and can skip the second gas station to reach the third gas station, where they can purchase $30$ gallons of gas for $30$ dollars, which is enough to reach their destination. This comes to a total of $110 + 30 = 140$ dollars spent on gas.

# Variations
See Road Trip II for a harder version, where you have to develop a linear solution and have a limited gas tank.
What happens if the mpg is not 1? What happens if we're not on a number line but instead a graph?


Problem Credits: Manu