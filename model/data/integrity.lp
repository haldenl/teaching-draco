:- data_fact(field,negative_min,F), not data_fact(field,negative_or_zero_min,F).
:- data_fact(field,cardinality_gt_20,F), not data_fact(field,cardinality_gt_8,F).
:- data_fact(overlap,definitely_overlap_fields,(F1,F2)), data_fact(overlap,definitely_not_overlap_fields,(F1,F2)).
