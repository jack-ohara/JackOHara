import * as React from 'react'
import { GetStaticProps } from 'next'
import { isDev, domain } from 'lib/config'
import { getSiteMap } from 'lib/get-site-map'
import { resolveNotionPage } from 'lib/resolve-notion-page'
import { PageProps, Params } from 'lib/types'
import { NotionPage } from 'components'
import * as config from 'lib/config'

export const getStaticProps: GetStaticProps<PageProps, Params> = async (context) => {
  const rawPageId = context.params.pageId as string

  try {
    const props = await resolveNotionPage(domain, rawPageId)

    return { props, revalidate: 10 }
  } catch (err) {
    console.error('page error', domain, rawPageId, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

export async function getStaticPaths() {
  if (isDev) {
    return {
      paths: [],
      fallback: true
    }
  }

  const siteMap = await getSiteMap()

  console.log('============================================')
  console.log('siteMap: ', siteMap)
  console.log('============================================')

  const pageSlugs = Object.keys(siteMap.canonicalPageMap)
    .filter(slug => !config.pagesToIgnore.includes(siteMap.canonicalPageMap[slug]))

  const staticPaths = {
    paths: pageSlugs.map((slug) => ({
      params: {
        pageId: slug
      }
    })),
    // paths: [],
    fallback: true
  }

  return staticPaths
}

export default function NotionDomainDynamicPage(props) {
  return <NotionPage {...props} />
}
