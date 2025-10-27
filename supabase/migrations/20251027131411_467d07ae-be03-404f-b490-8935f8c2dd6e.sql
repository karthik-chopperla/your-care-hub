-- Explicitly set the view to security invoker to clear the linter warning
ALTER VIEW doctors_public_view SET (security_invoker = true);