import fetch from 'node-fetch';

interface NpmPackage {
  name: string;
  description: string;
  version: string;
  downloads: number;
}

export async function searchNpmPackages(query: string): Promise<NpmPackage[]> {
  try {
    // 搜索 npm 包
    const searchResponse = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=5`);
    const searchData = await searchResponse.json() as any;

    // 获取下载量信息
    const packages = await Promise.all(
      searchData.objects.map(async (pkg: any) => {
        const downloadsResponse = await fetch(`https://api.npmjs.org/downloads/point/last-month/${pkg.package.name}`);
        const downloadsData = await downloadsResponse.json() as any;

        return {
          name: pkg.package.name,
          description: pkg.package.description || 'No description',
          version: pkg.package.version,
          downloads: downloadsData.downloads || 0
        };
      })
    );

    // 按下载量排序
    return packages.sort((a, b) => b.downloads - a.downloads);
  } catch (error) {
    console.error('Error searching npm packages:', error);
    return [];
  }
}
