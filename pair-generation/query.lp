#include "../model/data/grammar.lp".
#include "../model/data/integrity.lp".
#include "../model/data/generate.lp".
#include "../model/data/show.lp".
#include "../model/view/index.lp".
#include "../model/view/hard_integrity.lp".

% input is c1(type,constraint), c2(type,constraint).

% #const max_fields = 2.

view(v1).
view(v2).

:- c1(T,C), not soft(T,C,v1).
:- c1(T,C), soft(T,C,v2).

:- c2(T,C), not soft(T,C,v2).
:- c2(T,C), soft(T,C,v1).

% same fields
:- field(v1,_,F), not field(v2,_,F).
:- not field(v1,_,F), field(v2,_,F).

% fields have same types (too many useless combinations otherwise)
same_type(F,v1,E1,v2,E2) :- field(v1,E1,F), field(v2,E2,F), type(v1,E1,T1), type(v2,E2,T2), T1 = T2.
:- field(_,_,F), not same_type(F,_,_,_,_).

#minimize { 1@1,TYPE1,TYPE2,NAME1,NAME2: soft(TYPE1,NAME1,v1), soft(TYPE2,NAME2,v2), TYPE1 != TYPE2, NAME1 != NAME2 }.
% #minimize { W@2,TYPE,NAME,VIEW: soft(TYPE,NAME,VIEW), soft_weight(TYPE,NAME,W) }.
#minimize { 1@2,PROP,V,X: spec(PROP,V,X) }.
#minimize { 1@3,F: field_id(F) }.


#show soft/3.
#show hard/4.