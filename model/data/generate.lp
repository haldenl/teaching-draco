% fields
#const max_fields = 10.
0 { field_id(1..max_fields) } max_fields.
1 = { fieldtype(F,T): fieldtype_type(T) } :- field_id(F).
1 = { field(F) } :- fieldtype(F,_).

% fields
0 { data_fact(TYPE,NAME,F): field_id(F) } 1 :- data_fact(TYPE,NAME).
