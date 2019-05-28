% from input
fieldtype(F,T) :- fieldtype(F,T).
field(F) :- fieldtype(F,_).

% fields
data_fact(field,negative_min,F) :- extent(F,MIN,_), MIN < 0.

data_fact(field,negative_or_zero_min,F) :- extent(F,MIN,_), MIN <= 0.

data_fact(field,cardinality_gt_8,F) :- cardinality(F,C), C > 8.

data_fact(field,cardinality_gt_20,F) :- cardinality(F,C), C > 20.

data_fact(field,min_minus_max_gt_min_or_max_minus_zero,F) :- extent(F,MIN,MAX), EX = MAX - MIN, |MAX| > EX, |MIN| > EX.

data_fact(field,extent_includes_zero,F) :- extent(F,MIN,MAX), MIN < 0, MAX > 0.
% overlap
data_fact(overlap,definitely_overlap_fields,(F1,F2)) :- cardinality(F1,C1), cardinality(F2,C2), num_rows(S), S > C1 * C2.

data_fact(overlap,definitely_not_overlap_fields,(F1,F2)) :- cardinality(F1,C1), cardinality(F2,C2), num_rows(S), C1 = S, C2 = S.
