#include "type_channel/index.lp".
% #include "mark_type/index.lp".
% #include "encoding/index.lp".

soft(type_channel,NAME,V) :- type_channel_pref(NAME,V).
% soft(mark_type,NAME,V) :- mark_type_pref(NAME,V).
% soft(encoding,NAME,V,X) :- encoding_pref(NAME,V,E), X = E.


soft_weight(type_channel,NAME,W) :- type_channel_weight(NAME,W).
% soft_weight(mark_type,NAME,W) :- mark_type_weight(NAME,W).
% soft_weight(encoding,NAME,W) :- encoding_weight(NAME,W).