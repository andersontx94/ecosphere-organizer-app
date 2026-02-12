-- Optional manual fix for mojibake (e.g., "ServiÃ§o", "ResÃ­duos").
-- This script DOES NOT run automatically. Review and run manually in Supabase SQL editor.
-- It targets only rows that contain common mojibake markers (Ã or Â).
-- Make a backup before running.

-- Helper: fix common UTF-8 mojibake sequences stored as text
create or replace function public.fix_mojibake(input text)
returns text
language sql
immutable
as $$
  select
    replace(
      replace(
        replace(
          replace(
            replace(
              replace(
                replace(
                  replace(
                    replace(
                      replace(
                        replace(
                          replace(
                            replace(
                              replace(
                                replace(
                                  replace(
                                    replace(
                                      replace(
                                        replace(
                                          replace(
                                            replace(
                                              replace(
                                                replace(
                                                  replace(
                                                    replace(
                                                      replace(
                                                        replace(
                                                          replace(
                                                            replace(
                                                              replace(
                                                                replace(
                                                                  replace(
                                                                    replace(
                                                                      replace(
                                                                        replace(
                                                                          replace(
                                                                            replace(
                                                                              coalesce(input, ''),
                                                                              'Ã§','ç'),
                                                                            'Ã£','ã'),
                                                                          'Ã¡','á'),
                                                                        'Ã¢','â'),
                                                                      'Ã ','à'),
                                                                    'Ã¤','ä'),
                                                                  'Ã©','é'),
                                                                'Ãª','ê'),
                                                              'Ã¨','è'),
                                                            'Ã­','í'),
                                                          'Ã®','î'),
                                                        'Ã¬','ì'),
                                                      'Ã³','ó'),
                                                    'Ã´','ô'),
                                                  'Ãµ','õ'),
                                                'Ã²','ò'),
                                              'Ãº','ú'),
                                            'Ã»','û'),
                                          'Ã¹','ù'),
                                        'Ã¼','ü'),
                                      'Ã','Á'),
                                    'Ã‚','Â'),
                                  'Ãƒ','Ã'),
                                'Ã‰','É'),
                              'ÃŠ','Ê'),
                            'Ã','Í'),
                          'Ã“','Ó'),
                        'Ã”','Ô'),
                      'Ã•','Õ'),
                    'Ãš','Ú'),
                  'Ã‡','Ç'),
                'â€”','—'),
              'â€“','–'),
            'â€¢','•'),
          'â€œ','“'),
        'â€','”'),
      'Â','')
$$;

-- Services
update public.services
set
  name = public.fix_mojibake(name),
  category = public.fix_mojibake(category),
  description = public.fix_mojibake(description),
  unit = public.fix_mojibake(unit)
where
  name like '%Ã%' or name like '%Â%' or
  category like '%Ã%' or category like '%Â%' or
  description like '%Ã%' or description like '%Â%' or
  unit like '%Ã%' or unit like '%Â%';

-- Process types
update public.process_types
set name = public.fix_mojibake(name)
where name like '%Ã%' or name like '%Â%';

-- Process stages
update public.process_stages
set name = public.fix_mojibake(name)
where name like '%Ã%' or name like '%Â%';

-- Environmental processes (process_type/status/agency/notes)
update public.environmental_processes
set
  process_type = public.fix_mojibake(process_type),
  status = public.fix_mojibake(status),
  agency = public.fix_mojibake(agency),
  notes = public.fix_mojibake(notes)
where
  process_type like '%Ã%' or process_type like '%Â%' or
  status like '%Ã%' or status like '%Â%' or
  agency like '%Ã%' or agency like '%Â%' or
  notes like '%Ã%' or notes like '%Â%';

-- Cleanup
drop function if exists public.fix_mojibake(text);
