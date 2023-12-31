const PostCSSPlugin = require("eleventy-plugin-postcss");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const { compress } = require('eleventy-plugin-compress');

const fs = require("fs");

const outputDir = "public_html"

function getCommitHash(){
  const command = "git rev-parse HEAD"
  return require('child_process').execSync(command).toString().trim()
}

const currentCommitHash = getCommitHash()

console.log("currentCommitHash: ", currentCommitHash)

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(PostCSSPlugin);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  
  eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
    return (tags || []).filter(tag => ["all", "posts"].indexOf(tag) === -1);
  });

  let getSvgContent = function (file) {
    let relativeFilePath = `./src/assets/svg/${file}`;
    let data = fs.readFileSync(relativeFilePath, 
    function(err, contents) {
      if (err) return err
      return contents
    });

    return data.toString('utf8');
  }

  eleventyConfig.addShortcode("svg", getSvgContent);

  eleventyConfig.addWatchTarget("./src/assets/")
  eleventyConfig.addPassthroughCopy(
    "./src/assets/"
  )

  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: "https://steincode.com",
    },
  });

  eleventyConfig.addCollection("sitemap", function(collectionApi) {
    return collectionApi.getAll().filter(item => {
      if (item.data.page.outputFileExtension ==="html"){
        return true;
      }
    });
  });

  eleventyConfig.addFilter("bust_cache", (url) => {
    const [urlPart, paramPart] = url.split("?");
    const params = new URLSearchParams(paramPart || "");
    params.set("v", currentCommitHash);
    return `${urlPart}?${params}`;
});

  /* 
  Disabled for now - it ignores css files for some reasons
  
  eleventyConfig.addPlugin(compress, {enabled: false});
  
  */
  return {
    dir: {
      input: "src",
      output: outputDir,
    },
    templateFormats: [
      "md",
      "njk",
      "html",
    ],
  };
};