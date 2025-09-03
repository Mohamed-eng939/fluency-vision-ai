-- Add missing data_consent column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN data_consent boolean DEFAULT false;

-- Also add email_results preference column that's in the form
ALTER TABLE public.profiles 
ADD COLUMN email_results boolean DEFAULT true;

-- Add preferred_contact column
ALTER TABLE public.profiles 
ADD COLUMN preferred_contact text;

-- Add pronunciation_preference column  
ALTER TABLE public.profiles 
ADD COLUMN pronunciation_preference text;

-- Add promo_code column
ALTER TABLE public.profiles 
ADD COLUMN promo_code text;