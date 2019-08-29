view(v1).
view(v2).

#show soft/4.
#show hard/4.

:- field(v1,_,F), not field(v2,_,F).
:- not field(v1,_,F), field(v2,_,F).

:- fieldtype(F1,T1), fieldtype(F2,T2), F1 < F2, T1 > T2.
:- field(V,E1,F1), field(V,E2,F2), E1 < E2, F1 > F2.

:- field(v1,E1,F), field(v2,E2,F), type(v1,E1,T1), type(v2,E2,T2), T1 != T2.

% if one is bin, both must bin
:- field(V1,E1,F), field(V2,E2,F), bin(V1,E1,true), not bin(V2,E2,_).
:- field(V1,E1,F), field(V2,E2,F), bin(V1,E1,B1), bin(V2,E2,B2), B1 != B2.

% same with aggregate
:- field(V1,E1,F), field(V2,E2,F), aggregate(V1,E1,_), not aggregate(V2,E2,_).
:- field(V1,E1,F), field(V2,E2,F), aggregate(V1,E1,A1), aggregate(V2,E2,A2), A1 != A2.
