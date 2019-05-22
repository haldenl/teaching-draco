% @constraint Continuous on x channel.
type_channel_pref(continuous_x,V) :- channel_fact(continuous,V,x).

% @constraint Continuous on y channel.
type_channel_pref(continuous_y,V) :- channel_fact(continuous,V,y).

% @constraint Continuous on color channel.
type_channel_pref(continuous_color,V) :- channel_fact(continuous,V,color).

% @constraint Continuous on size channel.
type_channel_pref(continuous_size,V) :- channel_fact(continuous,V,size).

% @constraint Continuous on text channel.
type_channel_pref(continuous_text,V) :- channel_fact(continuous,V,text).

% @constraint Ordered on x channel.
type_channel_pref(ordered_x,V) :- channel_fact(discrete,V,x), channel_fact(ordered,V,x).

% @constraint Ordered on y channel.
type_channel_pref(ordered_y,V) :- channel_fact(discrete,V,x), channel_fact(ordered,V,y).

% @constraint Ordered on color channel.
type_channel_pref(ordered_color,V) :- channel_fact(discrete,V,x), channel_fact(ordered,V,color).

% @constraint Ordered on size channel.
type_channel_pref(ordered_size,V) :- channel_fact(discrete,V,x), channel_fact(ordered,V,size).

% @constraint Ordered on text channel.
type_channel_pref(ordered_text,V) :- channel_fact(discrete,V,x), channel_fact(ordered,V,text).

% @constraint Ordered on row channel.
type_channel_pref(ordered_row,V) :- channel_fact(discrete,V,x), channel_fact(ordered,V,row).

% @constraint Ordered on column channel.
type_channel_pref(ordered_column,V) :- channel_fact(discrete,V,x), channel_fact(ordered,V,column).

% @constraint Nominal on x channel.
type_channel_pref(nominal_x,V) :- channel_fact(nominal,V,x).

% @constraint Nominal on y channel.
type_channel_pref(nominal_y,V) :- channel_fact(nominal,V,y).

% @constraint Nominal on color channel.
type_channel_pref(nominal_color,V) :- channel_fact(nominal,V,color).

% @constraint Nominal on shape channel.
type_channel_pref(nominal_shape,V) :- channel_fact(nominal,V,shape).

% @constraint Nominal on text channel.
type_channel_pref(nominal_text,V) :- channel_fact(nominal,V,text).

% @constraint Nominal on row channel.
type_channel_pref(nominal_row,V) :- channel_fact(nominal,V,row).

% @constraint Nominal on column channel.
type_channel_pref(nominal_column,V) :- channel_fact(nominal,V,column).
