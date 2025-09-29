export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface OpenGraphTag {
  property: string;
  content: string;
}

export interface TwitterCardTag {
  name: string;
  content: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  author?: string;
  robots?: string;
  canonical?: string;
  openGraph?: OpenGraphTag[];
  twitterCard?: TwitterCardTag[];
  metaTags?: MetaTag[];
}

export const generateMetaTags = (metadata: SEOMetadata): string => {
  const tags: string[] = [];
  
  // Основные мета-теги
  tags.push(`<title>${metadata.title}</title>`);
  tags.push(`<meta name="description" content="${metadata.description}" />`);
  
  if (metadata.keywords) {
    tags.push(`<meta name="keywords" content="${metadata.keywords}" />`);
  }
  
  if (metadata.author) {
    tags.push(`<meta name="author" content="${metadata.author}" />`);
  }
  
  if (metadata.robots) {
    tags.push(`<meta name="robots" content="${metadata.robots}" />`);
  }
  
  if (metadata.canonical) {
    tags.push(`<link rel="canonical" href="${metadata.canonical}" />`);
  }
  
  // Open Graph теги
  if (metadata.openGraph) {
    metadata.openGraph.forEach(tag => {
      tags.push(`<meta property="${tag.property}" content="${tag.content}" />`);
    });
  }
  
  // Twitter Card теги
  if (metadata.twitterCard) {
    metadata.twitterCard.forEach(tag => {
      tags.push(`<meta name="${tag.name}" content="${tag.content}" />`);
    });
  }
  
  // Дополнительные мета-теги
  if (metadata.metaTags) {
    metadata.metaTags.forEach(tag => {
      if (tag.name) {
        tags.push(`<meta name="${tag.name}" content="${tag.content}" />`);
      } else if (tag.property) {
        tags.push(`<meta property="${tag.property}" content="${tag.content}" />`);
      }
    });
  }
  
  return tags.join('\n  ');
};

export const createOpenGraphTags = (
  title: string,
  description: string,
  url: string,
  image?: string,
  type: string = 'website'
): OpenGraphTag[] => {
  const tags: OpenGraphTag[] = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:type', content: type }
  ];
  
  if (image) {
    tags.push({ property: 'og:image', content: image });
  }
  
  return tags;
};

export const createTwitterCardTags = (
  title: string,
  description: string,
  image?: string,
  creator?: string
): TwitterCardTag[] => {
  const tags: TwitterCardTag[] = [
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description }
  ];
  
  if (image) {
    tags.push({ name: 'twitter:image', content: image });
  }
  
  if (creator) {
    tags.push({ name: 'twitter:creator', content: creator });
  }
  
  return tags;
};

export const generateStructuredData = (data: any): string => {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
};

export const createProductStructuredData = (
  name: string,
  description: string,
  price: number,
  currency: string = 'EUR',
  image?: string,
  availability: string = 'InStock'
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`
    }
  };
};

export const createOrganizationStructuredData = (
  name: string,
  url: string,
  logo?: string,
  description?: string
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description
  };
};

export const createBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
};

