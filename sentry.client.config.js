// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import * as client from "react-dom/client";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

const oldClientHydrateRoot = client.hydrateRoot;

client.hydrateRoot = new Proxy(oldClientHydrateRoot, {
  apply: (wrappingTarget, thisArg, args) => {
    const oldOnRecoverableError = args[2].onRecoverableError;

    args[2].onRecoverableError = new Proxy(oldOnRecoverableError, {
      apply: (inner_wrappingTarget, inner_thisArg, inner_args) => {
        const error = inner_args[0];
        const errorInfo = inner_args[1];

        console.log(error);
        console.log(errorInfo);
        console.log(errorInfo.componentStack);

        const errorBoundaryError = new Error(error.message);
        errorBoundaryError.name = `React ErrorBoundary ${errorBoundaryError.name}`;
        errorBoundaryError.stack = errorInfo.componentStack;

        // Using the `LinkedErrors` integration to link the errors together.
        error.cause = errorBoundaryError;

        Sentry.captureException(error, { contexts: { react: errorInfo } });
      },
    });

    return wrappingTarget.apply(thisArg, args);
  },
});

Sentry.init({
  dsn: SENTRY_DSN,
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
