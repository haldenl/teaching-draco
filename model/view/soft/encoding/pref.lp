% @constraint Prefer to use fewer encodings in general.
encoding_pref(encoding,V,E) :- encoding(V,E).

% @constraint Prefer to use fewer encodings with fields (count does not have a field).
encoding_pref(encoding_field,V,E) :- field(V,E,_).

% @constraint Prefer to use raw (no aggregate).
encoding_pref(aggregate,V,E) :- aggregate(V,E,_).

% @constraint Prefer to not bin.
encoding_pref(bin,V,E) :- bin(V,E,_).

% @constraint Prefer not to use the same field twice.
encoding_pref(same_field_2,V,F) :- view(V), field(F), { field(V,_,F) } = 2.

% @constraint Prefer not to use the same field three or more times.
encoding_pref(same_field_gte3,V,F) :- view(V), field(F), { field(V,_,F) } >= 3.

% @constraint Prefer not to use count more than once.
encoding_pref(count_twice,V) :- view(V), { aggregate(V,_,count) } >= 2.

% @constraint Prefer quantitative for bin.
encoding_pref(quant_bin,V,E) :- bin(V,E,_), not type(V,E,quantitative).

% @constraint Prefer not to use multiple non-positional encoding channels.
encoding_pref(multiple_non_pos,V) :- view(V), { channel(V,_,C): channel_definition(non_positional,C) } > 1.

% @constraint Aggregate plots should not use raw continuous as group by.
encoding_pref(aggregate_group_by_raw,E) :- aggregate(V,_,_), encoding_fact(continuous,V,E), not aggregate(V,E,_).

% @constraint Aggregate should also have a discrete encoding to group by.
encoding_pref(agg_dim,V) :- aggregate(V,_,_), not discrete(V,_).

% @constraint Prefer not to use plot with both x and y discrete and no aggregate as it leads to occlusion.
encoding_pref(x_y_raw,V,E) :- channel(V,EX,x), encoding_fact(discrete,V,EX), channel(V,EY,y), encoding_fact(discrete,V,EY), encoding(V,E), not aggregate(V,E,_), encoding_fact(continuous,V,E).

% @constraint Zero base for stack op.
encoding_pref(stack_zero,V) :- stack(V,zero).

% @constraint Normalize between groupbys as stack op.
encoding_pref(stack_normalize,V) :- stack(V,normalize).