[author: Manu]
[creation: 2023-10-13T16:00]

Although learning to make observations is perhaps one of the most important
skills in competitive programming, it is underepresented when it comes to
online material. We hope to provide some helpful tips on how to get better at
this.

Throughout this article, we will refer to the following problem as a case study:

# Problem

Alice has recently been delving into information theory! She has been reading
about the concept of a bitstring, which is just a list of 0s and 1s. In
particular, she has developed a certain routine whenever she sees a bitstring.
First, she looks at all occurrences of `01` substrings in the string, and marks
all the `1`s in the deletion pile. Simultaneously, she looks at all occurences
of `10` (which can possibly overlap with the `01`s) and marks all the `0`s in
the flip pile. Finally, she deletes all the `1`s in the deletion pile and flips
all the `0`s in the flip pile to become `1`s. Then, she restarts the procedure.
This continues until she is unable to perform any more operations, at which
point she moves onto the next bitstring.

For instance, when she sees the string `0011`, the first 1 will be deleted
giving us `001`, then right after we get `00` at which point the process
terminates. If instead the original string was `010`, we would mark the last
`0` in the flip pile and the `1` in the delete pile, giving us `01`, which then
becomes `0`.

Mugs is very angry that Alice is polluting the yard with all these digits!
Therefore, before Alice sees any bitstring, Mugs has decided to partition it
into some disjoint set of nonempty bitstrings (essentially, he makes 0 or more
cuts, splitting the bitstring into pieces). From here, Alice will perform her
routine on all resultant bitstrings independently.

Mugs hopes that by cutting the bitstring into pieces, the amount of final
digits (summed up over all the resultant strings) is minimized. Assuming he
partitions the string optimally, what is the minimum number of digits that will
be left after the simulation?

## Input

The first line contains a single integer $N$, where $1 \le N \le 10^5$. The
next line contains a bitstring with length $N$.

## Output

Output one line, the minimum number of digits that will be left after the
simulation if Mugs partitions it optimally.

## Example
```in
10
1110001101
```
```out
6
```

In this example, Mugs can possibly partition the string into `11`, `10`, and
`001101`. Alice will leave the first string untouched and transform the second
bitstring into `11`. The third bitstring will go through the following
procedure: `001101` $\to$ `0011` $\to$ `001` $\to$ `00`. Since each substring
ends up with $2$ digits, the total number of digits left is $2 + 2 + 2 = 6$.
This is the minimum possible number of digits left after the simulation.

# Editorial

We will now go through the thought process of how you should approach this
problem. Of course, there is no one correct way to solve a problem, but we
do hope to present a template that may help in learning how to approach
challenges.

## Mistakes

By far, the biggest mistake people have when trying to solve the
aforementioned Bitstring problem (and really, many other problems) is jumping
to the solution too quickly. The reason this is a bad strategy is we barely
even know what the problem is about after first reading it. At this point,
trying to come up with answers immediately is too premature. While it is
possible we may come up with a solution instantly, this is rarely the case
(which is especially true as problems increase in difficulty).

## Making Observations

The first step in tackling a competitive programming question is understanding
the problem statement and making observations. Understanding the problem
statement is more than just reading it and knowing what it means. Instead, we
must explore the underlying nature of the problem and be able to assert
useful lemmas about its behavior.

## Test Cases

A really great way to start is by making test cases of your own and trying to
notice patterns in the answer. Make sure to go beyond the samples!
Although they are helpful, problem authors never give away the full secret in
the samples alone. Test cases should be simple enough to make by hand but not
so simple that they aren't interesting.

For instance, in the bitstring problem we might want to try a string of a
single '0'. This turns out to be uninteresting, so we may add another '0' to
it. However, this too is rather boring as any string with just '0's will
instantly be finished.  The same is true about strings with all '1's.

Okay, now we know that any string where the entirety of the string is the same
digit is an ending state. Before we start exploring mixed strings, a good
question to ask ourselves is if the process in the question is even well
defined. Will it always reach an ending state? Playing around with a few
examples, you might be able to convince yourself that it necessarily will. And
honestly, this is enough. In competitive programming, we don't really need to
prove anything. Of course, proving things is better, but gaining the intuition
of when things are true or not is an extremely important skill that really
only comes with practice.

In our case, you might figure out it will always
terminate because after any given move, the length of the string will not
increase, and if it does stay constant, the number of zeros will decrease.
There is no possible way this can happen an infinite number of times. More formally,
the monovariant $X = 2 \times \text{number of 0s} + \text{number of 1s}$ must
be non-negative and strictly decrease after any given move.
A helpful exercise is proving this fact.

Lets get back to the meat of the problem by playing around with more examples.
Consider `101`. As per the rules, `101` becomes `11`, and stays there forever.
What about just `10`? That becomes `11` as well. `11011` becomes `1111`. Notice
how I am only picking examples that last a single round. These are relatively
simple, but still capture the heart of the problem. Anyways, if you're careful,
you may notice that all of these strings always become a full string of `1`s.
This fact turns out to be generally true for any starting string whose leading
digit is a `1`. Be careful not to take the observations too literally, however.
For instance, it would be wrong to claim that *all* strings end up as `1`s.
Small numbers can deceive you sometimes! Anyways, a helpful tip is to gain
intuition of something that might be true via generating test cases,
and then actually coming with the logic to convince yourself. Here, there is
no way we can delete the leading `1` or flip it, which implies the final string
must start with a `1`. However, we also know that the final string must be
entirely the same digit, which implies that it must be entirely `1`s.

A similar argument can be made for strings that start with `0`. Let's play
around with a few examples. `0111111111111` eventually becomes `0`. `01101`
becomes `0111` which then divulges into `0` as well. `00011` finalizes in
`000`. You should probably come up with a few more if you were actually
doing the problem, but an interesting result is the anything past the first
set of zeros will eventually be deleted. Again, don't take our word for it.
Do enough work to actually convince yourself. This is the baseline that's
generally most helpful. Something less rigorous than a proof, but more serious
than just noticing a pattern.

Other potential ideas for general test cases include degenerate cases (i.e. if
input is a tree, try sending in a linked list), extremums (maybe one value is
infinitely bigger than another), edge/boundary cases, etc. In general, try to
think of what a uniformly random generator *wouldn't* be likely to cover.
However, do note that there is no one template as test cases largely depend on
exact problme.

## Common Observation Strategies

Here are some other questions that I find helpful when you are stuck and
do not even know what you should be observing.

- Symmetry: In a counting problem for instance, can we show that one case
is a mirror image of another.
- Exchange arguments: Essentially showing that something will never/always
be optimal since by transforming it into something else, you will never/always
get a better result
- Reducability: Did you realize that this problem is actually just a special
case of another problem you know?
- End Behavior: Is the final result of simulation something that can be done
in a more direct way than what the problem statement implied?
- Case Analysis: Realizing that the problem falls into multiple disjoint cases,
but each one of them has a nice solution/simplification
- Lower and upper bounds: Showing that problem requires at least/at most N steps
- Recursion: Realizing that a problem/solution can be framed in terms of itself

Of course, this is not an exhaustive list.

## Solution

In fact, the observations we have previously listed are pretty much enough to
solve the bitstring problem. If you were actually solving this, it may or may
not be helpful to continue making observations. We can now connect the observations
we have made with the actual task in the problem. For one, we might want to
investigate which digits always exist, regardless of how we cut. We know all
the leading ones of the string must be there. Same with all the leading zeros.
Actually, we can make the latter condition more strict. If we have start our
string with a bunch of ones, and then have a block of zeros, that block of zeros
cannot be deleted. Note that it may flip depending on how we cut the string,
but it can never be deleted. This gives us a lower bound as the number of starting
ones + the size of the zero block that comes directly after it. Now that we have
a lower bound, we need to ask ourselves if we can come up with an algorithm
that will achieve that lower bound. That is, is the lower bound tight?
In fact, consider what happens if we make a single cut after the first block
of ones. Then, block of ones trivially remains. On the right cut, only the set of
zeros will remain due to our observation that anything after the first block
of zeros will be deleted. Note that the final amount of digits equals our lower
bound, which thus proves its optimality.

The implementation is as simple as the following:

```cpp
long long solve(const vector<bool>& string) {

    long long index = 0;

    while (index < string.size() &&  string[index]) ++index;
    while (index < string.size() && !string[index]) ++index;

    return index;
}
```

## Takeaways

The key takeaway from this article should be to recognize the importance of
making test cases and coming up with observations. Never feel rushed to jump
into the solution! Of course, lots of observations in this article were
presented rather inorganically in the sense that you probably wouldn't
discover the facts in this exact order. However, it does accurately present
the type of information you should be seeking out.