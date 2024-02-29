#!/bin/bash

# remove < and > character prefixed with \ in return method definitions
find ../docs -type f -name '*.md' -exec sed -i 's|\\<|\&lt;|g' {} +
find ../docs -type f -name '*.md' -exec sed -i 's|\\>|\&gt;|g' {} +

# replace \| with |
find ../docs -type f -name '*.md' -exec sed -i 's/\\|/|/g' {} +

# replace \_ with _ in files with _ in their names
find ../docs -type f -name '*_*' -name '*.md' -exec grep -lZ '\\_' {} + | xargs -0 sed -i 's/\\_/_/g'

# remove Inherit Doc headers
find ../docs -type f -name '*.md' -exec sed -i '/#### Inherit Doc/d' {} +

# replace ethers text style format

# replace %%something%% with `something`
find ../docs -type f -name '*.md' -exec sed -i "s|%%\([^%]*\)%%|\`\1\`|g" {} +

# replace [[ and ]] with `
find ../docs -type f -name '*.md' -exec sed -i 's|\[\[|`|g' {} +
find ../docs -type f -name '*.md' -exec sed -i 's|\]\]|`|g' {} +
