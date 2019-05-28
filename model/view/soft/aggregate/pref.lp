% @constraint Count as aggregate op.
aggregate_pref(aggregate_count,V,E) :- aggregate(V,E,count).

% @constraint Sum as aggregate op.
aggregate_pref(aggregate_sum,V,E) :- aggregate(V,E,sum).

% @constraint Mean as aggregate op.
aggregate_pref(aggregate_mean,V,E) :- aggregate(V,E,mean).

% @constraint Median as aggregate op.
aggregate_pref(aggregate_median,V,E) :- aggregate(V,E,median).

% @constraint Min as aggregate op.
aggregate_pref(aggregate_min,V,E) :- aggregate(V,E,min).

% @constraint Max as aggregate op.
aggregate_pref(aggregate_max,V,E) :- aggregate(V,E,max).

% @constraint Standard Deviation as aggregate op.
aggregate_pref(aggregate_stdev,V,E) :- aggregate(V,E,stdev).
