#!/bin/bash
# Generate expressive images for the homepage Products section (AGMA TEC)
# Brand style: deep navy + cobalt/electric blue + cyan, premium cinematic 3D glass,
# no text/letters/logos (AI text renders as gibberish), landscape 1440x720 for card banners.
set -e
cd /home/z/my-project
mkdir -p public/products

STYLE="premium cinematic 3D render, deep navy blue environment, cobalt blue and electric cyan accent lighting, frosted glass and matte materials, soft studio lighting, elegant minimal high-end enterprise technology aesthetic, no text, no letters, no logos, no words, high quality, detailed"

z-ai image -p "Integrated enterprise resource planning concept: interconnected translucent glass modules and floating abstract data panels arranged around one glowing central core, flowing light streams connecting them, $STYLE" -o public/products/agma-erp.png -s 1344x768

z-ai image -p "Smart facility management concept: elegant modern glass office tower on a reflective dark surface, surrounded by floating translucent holographic panels with abstract charts and gear silhouettes, subtle blueprint grid, $STYLE" -o public/products/agma-cafm.png -s 1344x768

z-ai image -p "Catering management platform concept: elegant floating glass cloche over a gourmet plated meal on a dark reflective service tray, surrounded by translucent holographic order panels and flowing data streams, $STYLE" -o public/products/agma-catering.png -s 1344x768

echo "--- generated ---"
ls -la public/products/
