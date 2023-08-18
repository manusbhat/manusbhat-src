#pragma once

#include <bits/stdc++.h>

using namespace std;

using l = long long;
using b = bool;
using vl = vector<l>;
using sl = set<l>;
using adjl = vector<vl>;

#define bg(x) begin(x)
#define all(x) bg(x), end(x)

constexpr l INF = 0x7f7f7f7f7f7f7f7f;

l randl(l s, l e) {
    assert(s < e);
    return s + (l) rand() % (e - s);
}

vl randvl(int n, l s, l e) {
    vl v(n);
    for (int i = 0; i < n; i++) {
        v[i] = randl(s, e);
    }

    return v;
}

sl randsl(int n, l s, l e) {
    sl v;
    while (v.size() < n) {
        v.insert(randl(s, e));
    }

    return v;
}

vl sltovl(const sl& s) {
    vl v(all(s));
    return v;
}

void shuffle(vl& vl) {
   for (int i = 0; i < vl.size(); ++i) {
       l next = randl(i, vl.size());
       swap(vl[i], vl[next]);
   }
}

vl randpl(l n) {
    vl v(n);
    iota(all(v), 1);
    shuffle(v);

    return v;
}

adjl randgraph(l n, l m, b simple=true);
adjl randdag(l n, l m, b simple=true);

adjl randtree(l n) {
    adjl adj(n);
    for (int i = 1; i < n; ++i) {
        l parent = randl(0, i);
        adj[parent].push_back(i);
        adj[i].push_back(parent);
    }

    return adj;
}

adjl randtree_star(l n, l k) {
    adjl adj(n);
    vl prev(k);
    for (l i = 1; i < n; ++i) {
        l bucket = randl(0, k);
        l p = prev[bucket];
        adj[i].push_back(p);
        adj[p].push_back(i);
        prev[bucket] = i;
    }

    return adj;
}

adjl randtree_list(l n) {
    vl perm = randpl(n);
    adjl adj(n);
    for (l i = 1; i < n; ++i) {
        adj[perm[i - 1] - 1].push_back(perm[i] - 1);
        adj[perm[i] - 1].push_back(perm[i - 1] - 1);
    }

    return adj;
}

adjl randtree_perfect(l n, l k) {
    adjl adj(n);
    for (l i = 1; i < n; ++i) {
        l parent = (i - 1) / k;
        adj[parent].push_back(i);
        adj[i].push_back(parent);
    }

    return adj;
}

void print_adjl(const adjl& adj, opipe& out) {
    for (l i = 0; i < adj.size(); ++i) {
        for (l j: adj[i]) {
            if (i > j) continue;

            if (randl(0, 2)) {
                out << i + 1 << " " << j + 1 << '\n';
            }
            else {
                out << j + 1 << " " << i + 1 << '\n';
            }
        }
    }
}