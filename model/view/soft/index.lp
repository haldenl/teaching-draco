#include "type_channel/index.lp".
#include "mark_type/index.lp".
#include "encoding/index.lp".
#include "aggregate/index.lp".
#include "scale/index.lp".


soft(TYPE,NAME,true) :- soft(TYPE,NAME). 

% type channel
soft(type_channel,NAME,V) :- type_channel_pref(NAME,V).
soft_weight(type_channel,NAME,W) :- type_channel_weight(NAME,W).

% mark type
soft(mark_type,NAME,V) :- mark_type_pref(NAME,V).
soft_weight(mark_type,NAME,W) :- mark_type_weight(NAME,W).

% encoding
soft(encoding,NAME,V,X) :- encoding_pref(NAME,V,E), X = E.
soft(encoding,NAME,V) :- encoding_pref(NAME,V).
soft_weight(encoding,NAME,W) :- encoding_weight(NAME,W).

% aggregate
soft(aggregate,NAME,V,X) :- aggregate_pref(NAME,V,E), X = E.
soft_weight(aggregate,NAME,W) :- aggregate_weight(NAME,W).

% scale
soft(scale,NAME,V,X) :- scale_pref(NAME,V,E), X = E.
soft_weight(scale,NAME,W) :- scale_weight(NAME,W).
