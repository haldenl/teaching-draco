% #include "../../draco/model/data/index.lp".

% input is c1(type,constraint), c2(type,constraint).

% #const max_fields = 2.
% c1(aggregate,count).
% c2(datatype,boolean_ordinal).

view(v1).
view(v2).

:- c1(TYPE,NAME), not soft(TYPE,NAME,v1,_).
:- c1(TYPE,NAME), soft(TYPE,NAME,v2,_).

:- c2(TYPE,NAME), not soft(TYPE,NAME,v2,_).
:- c2(TYPE,NAME), soft(TYPE,NAME,v1,_).

% same fields
:- field(v1,_,F), not field(v2,_,F).
:- not field(v1,_,F), field(v2,_,F).

% fields have same types (too many useless combinations otherwise)
same_type(F,v1,E1,v2,E2) :- field(v1,E1,F), field(v2,E2,F), type(v1,E1,T1), type(v2,E2,T2), T1 = T2.
:- field(_,_,F), not same_type(F,_,_,_,_).

#minimize { 1@1,TYPE1,TYPE2,NAME1,NAME2,X1,X2: soft(TYPE1,NAME1,v1,X1), soft(TYPE2,NAME2,v2,X2), TYPE1 != TYPE2, NAME1 != NAME2 }.
#minimize { W@2,TYPE,NAME,VIEW: soft(TYPE,NAME,VIEW,X), soft_weight(TYPE,NAME,W) }.
#minimize { 1@3,PROP: spec(PROP,V1,X), spec(PROP,V2,Y), V1 != V2, X < Y }.
% #minimize { 1@4,F: field_id(F) }.

% :- field(V,E1,F1), field(V,E2,F2), E1 > E2, F1 <= F2.

#show soft/4.
#show hard/4.
