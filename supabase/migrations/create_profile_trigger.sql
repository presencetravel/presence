create or replace function public.handle_new_user()
returns trigger as $$
begin
insert into public.profiles (id, full_name, school, sport, home_airport, verified)
values (
new.id,
new.raw_user_meta_data->>'full_name',
new.raw_user_meta_data->>'school',
new.raw_user_meta_data->>'sport',
new.raw_user_meta_data->>'home_airport',
false
);
return new;
end;
$$ language plpgsql security definer;
create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
