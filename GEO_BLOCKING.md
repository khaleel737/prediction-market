# Geo-Blocking

Block visitors from specific countries via the Admin panel. This guide covers how the feature works and how to configure it for different deployment platforms.

## How it works

1. Admin enables geo-blocking in **Admin > General Settings > Geo-blocking**
2. Admin selects which countries to block and sets a custom message
3. On each page load, the app reads the visitor's country from an HTTP header injected by the hosting platform
4. If the visitor's country matches the blocked list, a non-dismissible overlay is displayed with the configured message

## Platform configuration

### Vercel (default)

No configuration needed. Vercel automatically injects the `X-Vercel-IP-Country` header on every request with the visitor's [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country code.

The header is only available on deployed environments — it is not set when running locally with `next dev`.

For more details, see [Vercel Geolocation Headers](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package#geolocation).

### Cloudflare

If you use Cloudflare as a CDN/proxy in front of your deployment (any platform), Cloudflare automatically injects the `CF-IPCountry` header.

1. In the Admin panel, go to **General Settings > Geo-blocking**
2. Set **Custom geo header** to `CF-IPCountry`
3. Save settings

No additional Cloudflare configuration is needed — the header is included on all plans including the free tier.

### AWS CloudFront

CloudFront can forward the viewer's country as a header to your origin.

1. In the CloudFront distribution settings, add `CloudFront-Viewer-Country` to the **Origin Request Policy** headers whitelist
2. In the Admin panel, set **Custom geo header** to `CloudFront-Viewer-Country`
3. Save settings

See [AWS CloudFront headers documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/adding-cloudfront-headers.html) for details.

### Nginx (with GeoIP2 module)

If you run Nginx as a reverse proxy, you can use the GeoIP2 module to inject a country header.

1. Install `ngx_http_geoip2_module` and download the [MaxMind GeoLite2-Country database](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data)
2. Add to your Nginx config:

```nginx
geoip2 /path/to/GeoLite2-Country.mmdb {
    auto_reload 24h;
    $geoip2_data_country_code country iso_code;
}

server {
    # ... your existing config ...

    location / {
        proxy_set_header X-GeoIP-Country $geoip2_data_country_code;
        proxy_pass http://your-upstream;
    }
}
```

3. In the Admin panel, set **Custom geo header** to `X-GeoIP-Country`
4. Save settings

### Traefik

If you use Traefik as your reverse proxy with the GeoIP2 plugin:

1. Install the [Traefik GeoIP2 plugin](https://plugins.traefik.io/plugins/628c9ebcffc0cd18356a979d/geo-ip2)
2. Configure it to add a country header to requests
3. In the Admin panel, set **Custom geo header** to the header name your Traefik plugin uses (e.g., `X-GeoIP-Country`)
4. Save settings

### Docker / Kubernetes (self-hosted)

For self-hosted deployments without a CDN:

- **Recommended**: Place [Cloudflare](https://www.cloudflare.com/) (free tier) in front of your deployment. This gives you the `CF-IPCountry` header automatically with zero code changes.
- **Alternative**: Use an Nginx ingress controller with the GeoIP2 module (see Nginx section above).

Without a reverse proxy or CDN that injects a geo header, geo-blocking will not activate. The feature degrades gracefully — no errors, no broken pages, the overlay simply does not appear.

## Testing

The geo header is only available in deployed environments. When running locally with `next dev`, the `/api/geo` endpoint will return `{ country: null }` and geo-blocking will not activate.

To test locally, you can manually set the header using a tool like `curl`:

```bash
curl -H "X-Vercel-IP-Country: US" http://localhost:3000/api/geo
```

## Admin settings reference

| Setting | Description |
|---------|-------------|
| **Enable geo-blocking** | Toggle to activate/deactivate the feature |
| **Blocked countries** | Select countries to block (ISO 3166-1 alpha-2 codes) |
| **Blocked message** | Custom message shown to blocked visitors. Leave empty for default |
| **Custom geo header** | HTTP header name for non-Vercel deployments. Leave empty to use `X-Vercel-IP-Country` |
