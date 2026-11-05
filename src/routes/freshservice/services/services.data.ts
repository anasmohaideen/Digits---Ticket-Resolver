/**
 * Service catalogue, read off /a/services/view/all.
 *
 * Services is the first child of IT Operations, so it answers at the group's
 * own route. The tenant has no services, and unlike the other quiet views this
 * one sells the feature rather than just reporting the absence: a heading, a
 * sentence of rationale, and a way to start.
 */

export const SERVICES_MODULE = 'Services';
export const SERVICES_VIEW = 'All Services';

export const SERVICES_POTENTIAL = 'Potential services';
export const SERVICES_NEW = 'New service';

export const SERVICES_EMPTY_TITLE = 'Connect the dots';
export const SERVICES_EMPTY_BODY =
  'Adopt service oriented operations by monitoring the health of your business and technical services.';
export const SERVICES_EMPTY_ACTION = 'Create a service';

/* ---------------------------------------------------------------------------
 * Potential services, read off /a/services/potential-services.
 *
 * A second page behind the toolbar's "Potential services" action, with its own
 * pair of underline tabs.
 * ------------------------------------------------------------------------- */

export const POTENTIAL_TITLE = 'Potential services';
export const POTENTIAL_TABS = ['Potential services', 'Dismissed services'];

export const POTENTIAL_NOTICE =
  'Potential services older than 30 days will automatically be deleted. Approve or dismiss the suggestions now.';

export const POTENTIAL_EMPTY = 'No potential services yet';

/** The page explains itself at length; kept verbatim. */
export const POTENTIAL_BLURB =
  'Once you map a monitoring tool to multiple services, Freshservice evaluates alerts received to see if they qualify to be associated with a service. If they do, Freshservice will share them with you as Potential Services. These Potential Services can be Approved or Dismissed. If Approved a service can be merged with an existing service or created as a new service. If dismissed, it is categorized as Dismissed Services. Potential services older than 30 days will automatically be deleted.';
export const POTENTIAL_BLURB_LINK = 'Know more';
