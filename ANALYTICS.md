# Analytics Setup Guide

Your blog now supports multiple analytics platforms. Choose one that fits your needs:

## Option 1: Google Analytics 4 (Free, Comprehensive)

1. **Create GA4 Property**: Visit [analytics.google.com](https://analytics.google.com)
2. **Get Measurement ID**: It looks like `G-XXXXXXXXXX`
3. **Enable in hugo.toml**: Uncomment and replace:
   ```toml
   googleAnalytics = 'G-XXXXXXXXXX' # <- Your actual measurement ID
   ```

## Option 2: Plausible Analytics (Privacy-focused, Paid)

1. **Sign up**: Visit [plausible.io](https://plausible.io)
2. **Add your domain**: clustersandclimate.com
3. **Enable in hugo.toml**: Uncomment:
   ```toml
   plausibleDomain = 'clustersandclimate.com'
   ```

## Option 3: Simple Analytics (Privacy-focused, Paid)

1. **Sign up**: Visit [simpleanalytics.com](https://simpleanalytics.com)
2. **Add your domain**: clustersandclimate.com
3. **Enable in hugo.toml**: Uncomment:
   ```toml
   simpleAnalytics = true
   ```

## Current Status
- ❌ No analytics currently active
- ✅ Ready to enable any option above
- ✅ Privacy-friendly by default (no tracking until you enable it)

## Testing
After enabling any option:
1. Build your site: `hugo`
2. Check the generated HTML in `public/` for analytics scripts
3. Deploy and verify tracking in your analytics dashboard

## Privacy Considerations
- Google Analytics: Most comprehensive but Google has access to data
- Plausible/Simple Analytics: Privacy-focused, GDPR compliant, no cookies
- All options: Consider adding a privacy policy to your site
