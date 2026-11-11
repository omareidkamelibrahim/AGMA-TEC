#!/bin/bash
# Generate expressive wide-scene hero images for the /products page panels (AGMA TEC)
# Same brand style as the homepage card visuals (deep navy + cobalt/cyan, cinematic 3D glass)
# but with richer, environmental establishing-shot compositions — no text/letters/logos.
set -e
cd /home/z/my-project
mkdir -p public/products

STYLE="premium cinematic 3D render, deep navy blue environment, cobalt blue and electric cyan accent lighting, frosted glass and matte materials, soft studio lighting, elegant minimal high-end enterprise technology aesthetic, wide establishing shot, atmospheric depth, volumetric light, no text, no letters, no logos, no words, no people, high quality, detailed"

z-ai image -p "Wide cinematic aerial night view of a futuristic corporate campus: several elegant glass office towers connected by flowing rivers of blue light streaming between rooftops like luminous data highways, one central tower emitting a soft holographic ring, tiny glowing windows, misty atmosphere between buildings, $STYLE" -o public/products/agma-erp-hero.png -s 1344x768

z-ai image -p "Wide cinematic interior view of a grand modern glass building atrium at dusk, sweeping walkways and elevator banks, translucent holographic panels floating beside the elevators showing abstract gauges and maintenance silhouettes, floor glowing with a subtle blueprint grid, light beams from a glass ceiling, $STYLE" -o public/products/agma-cafm-hero.png -s 1344x768

z-ai image -p "Wide cinematic view of an immaculate professional hotel kitchen at night, long polished stainless steel plating counter, gentle steam rising from elegant cloches, floating translucent holographic order cards hovering above the counter, dramatic contrast between warm amber kitchen glow and cool cyan holographic light, $STYLE" -o public/products/agma-catering-hero.png -s 1344x768

echo "--- generated ---"
ls -la public/products/
