[kb_limit: 256000]
[ms_limit: 1000]
[rating: 240]



What is the minimum amount of money Mugs and Alice must spend to reach their destination?

# Input 

The first line contains the integers $G, D,$ and $N$.
The next $N$ lines contain two integers: $x_i$ and $c_i$. It is guaranteed that $1 \le x_1 \le x_2 \le \ldots \le x_N \le D$.

# Output

Output one line, the minimum amount of money Mugs and Alice must spend to reach their destination. If it is impossible to reach their destination, output -1.

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