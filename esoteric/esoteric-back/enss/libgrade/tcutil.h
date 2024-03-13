#pragma once

#include <bits/stdc++.h>

using namespace std;

using ll = long long;
using b = bool;
using vl = vector<ll>;
using sl = set<ll>;
using adjl = vector<vl>;

#define bg(x) std::begin(x)
#define all(x) bg(x), std::end(x)

constexpr ll INF = 0x7f7f7f7f7f7f7f7f;

ll randl(ll s, ll e) {
    assert(s < e);
    return s + (ll) rand() % (e - s);
}

vl randvl(int n, ll s, ll e) {
    vl v(n);
    for (int i = 0; i < n; i++) {
        v[i] = randl(s, e);
    }

    return v;
}

sl randsl(int n, ll s, ll e) {
    sl v;
    while (v.size() < n) {
        v.insert(randl(s, e));
    }

    return v;
}

vl sltovl(const sl& s) {
    vl v(all(s));
    sort(v.begin(), v.end());
    return v;
}

void shuffle(vl& vl) {
   for (int i = 0; i < vl.size(); ++i) {
       ll next = randl(i, vl.size());
       swap(vl[i], vl[next]);
   }
}

vl randpl(ll n) {
    vl v(n);
    iota(all(v), 1);
    shuffle(v);

    return v;
}

void adj_edge(adjl& adj, ll u, ll v) {
    adj[u].push_back(v);
    adj[v].push_back(u);
}

adjl randgraph(ll n, ll m, b simple=true);
adjl randdag(ll n, ll m, b simple=true);

adjl randtree(ll n) {
    adjl adj(n);
    for (int i = 1; i < n; ++i) {
        ll parent = randl(0, i);
        adj[parent].push_back(i);
        adj[i].push_back(parent);
    }

    return adj;
}

adjl randtree_star(ll n, ll k) {
    adjl adj(n);
    vl prev(k);
    for (ll i = 1; i < n; ++i) {
        ll bucket = randl(0, k);
        ll p = prev[bucket];
        adj[i].push_back(p);
        adj[p].push_back(i);
        prev[bucket] = i;
    }

    return adj;
}

adjl randtree_list(ll n) {
    vl perm = randpl(n);
    adjl adj(n);
    for (ll i = 1; i < n; ++i) {
        adj[perm[i - 1] - 1].push_back(perm[i] - 1);
        adj[perm[i] - 1].push_back(perm[i - 1] - 1);
    }

    return adj;
}

adjl randtree_perfect(ll n, ll k) {
    adjl adj(n);
    for (ll i = 1; i < n; ++i) {
        ll parent = (i - 1) / k;
        adj[parent].push_back(i);
        adj[i].push_back(parent);
    }

    return adj;
}

void print_adjl(const adjl& adj, opipe& out) {
    for (ll i = 0; i < adj.size(); ++i) {
        for (ll j: adj[i]) {
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