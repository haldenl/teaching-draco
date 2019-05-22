#include "../model/data/grammar.lp".
#include "../model/data/integrity.lp".
#include "../model/data/generate.lp".
#include "../model/data/show.lp".
#include "../model/view/index.lp".
#include "../model/view/hard_integrity.lp".

% #const max_fields = 2.

view(v1).
view(v2).

:- c1(T,C), not soft(T,C,v1).
:- c2(T,C), soft(T,C,v2).

:- c1(T,C), not soft(T,C,v2).
:- c2(T,C), soft(T,C,v1).

:- field(v1,_,F), not field(v2,_,F).
:- not field(v1,_,F), field(v2,_,F).

#minimize { 1@1,TYPE1,TYPE2,NAME1,NAME2: soft(TYPE1,NAME1,v1), soft(TYPE2,NAME2,v2), TYPE1 != TYPE2, NAME1 != NAME2 }.
% #minimize { W@2,TYPE,NAME,VIEW: soft(TYPE,NAME,VIEW), soft_weight(TYPE,NAME,W) }.
#minimize { 1@2,PROP,V,X: spec(PROP,V,X) }.
#minimize { 1@3,F: field_id(F) }.


#show soft/3.
#show hard/4.