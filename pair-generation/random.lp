view(v1).
view(v2).

encoding(v1,e0).
encoding(v2,e0).
encoding(v1,e1).
encoding(v2,e1).
encoding(v1,e2).
encoding(v2,e2).

#show soft/4.
#show hard/4.

% :- field(v1,_,F), not field(v2,_,F).
% :- not field(v1,_,F), field(v2,_,F).

% :- fieldtype(F1,T1), fieldtype(F2,T2), F1 < F2, T1 > T2.
% :- field(V,E1,F1), field(V,E2,F2), E1 < E2, F1 > F2.

% :- field(v1,E1,F), field(v2,E2,F), type(v1,E1,T1), type(v2,E2,T2), T1 != T2.
