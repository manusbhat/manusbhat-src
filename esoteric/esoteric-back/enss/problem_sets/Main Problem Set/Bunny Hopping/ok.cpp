#include "libgrade.h"

int init(void) {
    return 12;
}

// jiaming method, log n faster, although on test data seems to perform slightly slower?
// precomp[block][jump_size][offset]
ll precomp[300][300][300];
vl fast_solve(const vl& s, const vector<pair<int, pair<ll, ll>>>& queries) {
	vl updated_s = s;
	ll N = s.size();
	ll Q = queries.size();
	ll SQRT = (ll) ceil(sqrt(N));

	for (int i = 0, b = 0; b < N; b += SQRT, ++i) {
		for (int jump = 1; jump <= SQRT; ++jump) {
			for (int off = 0; off < jump; ++off) {
				ll sum = 0;
				for (int k = off + b; k < min(N, b + SQRT); k += jump) {
					sum += updated_s[k];
				}

				precomp[i][jump][off] = sum;
			}
		}
	}

	vl out;
	for (const auto& q: queries) {
		if (q.first == 1) {
			ll start = q.second.first;
			ll k = q.second.second;

			ll sum = 0;
			if (abs(k) > SQRT) {
				for (ll j = start; j < N && j >= 0; j += k) sum += updated_s[j];
			}
			else {
				ll s = k > 0 ? start : start % k;
				ll e = k > 0 ? N : start + 1;
                k = abs(k);

				if (e - s <= SQRT) {
					for (int j = s; j < e; j += k) sum += updated_s[j];
				}
				else {
					ll it = s;
					while (it < e) {
						ll blck = it / SQRT;
						if (blck == s / SQRT) {
							for (; it / SQRT == s / SQRT; it += k) sum += updated_s[it];
							continue;
						}
						else if (blck == e / SQRT) {
							for (; it < e; it += k) sum += updated_s[it];
							break;
						}

						sum += precomp[it / SQRT][k][it % SQRT % k];
						it += (SQRT - it % SQRT + k - 1) / k * k;
					}
				}
			}
			out.push_back(sum);
		}
		else {
			ll patch = q.second.first;
			ll juice = q.second.second;
			ll delta = juice - updated_s[patch];

			int block = patch / SQRT;
            ll ind = patch % SQRT;
			for (int i = 1; i <= SQRT; ++i) {
				ll mod = ind % i;
				precomp[block][i][mod] += delta;
			}
			updated_s[patch] = juice;
		}
	}

	return out;
}


// 1 indexed
void bit_update(vl& data, ll index, ll delta) {
    for (; index < data.size(); index += index & -index) {
        data[index] += delta;
    }
}

ll bit_query(const vl& data, ll index) {
    ll sum = 0;
    for (; index > 0; index -= index & -index) {
        sum += data[index];
    }

    return sum;
}

//bit[jump_size][starting_mod][jumps_taken]; O(N\sqrt{N})
vector<vector<vl>> bit;
vl solve(const vl& s, const vector<pair<int, pair<ll, ll>>>& queries) {
    vl updated_s = s;
    ll N = s.size();
    ll Q = queries.size();
    ll SQRT = (ll) ceil(sqrt(N));

    bit = vector<vector<vl>>(SQRT + 1);
    for (int i = 1; i <= SQRT; ++i) {
        bit[i] = vector<vl>(i);
        for (int j = 0; j < i; ++j) {
            bit[i][j] = vl((N + i - 1) / i + 1);
            ll sum = 0;
            for (int k = j, q = 1; k < N; k += i, q++) {
                bit_update(bit[i][j], q, updated_s[k]);
            }
        }
    }

    vl out;
    for (const auto& q: queries) {
        if (q.first == 1) {
            ll start = q.second.first;
            ll k = q.second.second;

            ll sum = 0;
            if (abs(k) > SQRT) {
                for (ll j = start; j < N && j >= 0; j += k) sum += updated_s[j];
            }
            else {
                ll bucket = start % abs(k);
                if (k > 0) {
                    sum = bit_query(bit[k][bucket], bit[k][bucket].size() - 1) -
                          bit_query(bit[k][bucket], (start - bucket) / k + 1) +
                          updated_s[start];
                }
                else {
                    sum = bit_query(bit[-k][bucket], (start - bucket) / -k + 1);
                }
            }
            out.push_back(sum);
        }
        else {
            ll patch = q.second.first;
            ll juice = q.second.second;
            ll delta = juice - updated_s[patch];

            for (int i = 1; i <= SQRT; ++i) {
                ll mod = patch % i;
                bit_update(bit[i][mod], (patch - mod) / i + 1, delta);
            }

            updated_s[patch] = juice;
        }
    }


    return out;
}

bool ok(int n, opipe& out, ipipe& in) {
    ll s = min((ll) 3e4, n * n * 1000ll);
    ll e = min((ll) 5e4, (n + 1) * (n + 1) * 1000ll);
    ll N = randl(s, e);
    ll SQRT = (ll) ceil(sqrt(N));
    ll Q = randl(s / 3, e / 3);

    vl start = randvl(N, 0, 1e5);
    vector<pair<int, pair<ll, ll>>> queries;
    for (int i = 0; i < Q; ++i) {
        int type = randl(1, 3);
        ll x, y;
        if (type == 1) {
            if (n == 7) {
                x = randl(0, N);
                y = randl(1, SQRT);
                if (randl(0, 2)) y = -y;
            }
            else if (n == 8) {
                x = randl(0, N);
                y = randl(SQRT, N);
                if (randl(0, 2)) y = -y;
            }
            else if (n == 9) {
                x = randl(0, SQRT);
                y = randl(1, 4);
            }
            else {
                x = randl(0, N);
                y = randl(1, N);
                if (randl(0, 2)) y = -y;
            }
        }
        else {
            x = randl(0, N);
            y = randl(1, 1e5);
        }

        queries.emplace_back(type, make_pair(x, y));
    }

    out << N << ' ' << Q << '\n';
    for (ll s: start) out << s << ' ';
    out << '\n';
    for (const auto& q: queries) {
        out << q.first << ' ' << q.second.first + 1 << ' ' << q.second.second << '\n';
    }
    out.flush();

    vl ans = fast_solve(start, queries);
    for (ll sub: ans) {
        ll cmp;
        in >> cmp;
        if (cmp != sub) return false;
    }

    return true;
}
