[kb_limit: 256000]
[ms_limit: 1000]
[rating: 350]
[creation: 2023-08-14T16:00]
[close: 2023-08-14T16:00]

TODO: 

We are given $N$ bunnies who compete in a race, but some are given a head start. Thus, their position can be computed as $A^2t^2 + 2Abx + b^2$ (maybe this can be hidden better). We want to find out the leader of the pack at several time spots. However, there are also update queries, where we may insert a rabbit into the race (as if it was there from the very start), and we now have to include this rabbit in all future queries of the leader.

Solution: pretty much notice that this is of the form (Ax + b)^2 and thus we can apply the convex hull trick.

# Input
# Output

# Example


Problem Credits: Manu