// Optimized Merchant Logo Resolver
// Strategy:
// 1) Cache-first approach with localStorage persistence
// 2) Comprehensive merchant database with fuzzy matching
// 3) Real-time domain extraction and validation
// 4) Multiple fallback sources (Clearbit, IconHorse, Google Favicons)
// 5) Background logo preloading and validation

import { ErrorLogger } from '../utils/errorLogger';

// Comprehensive merchant database - major vendors with their domains
const MERCHANT_DATABASE: Record<string, string> = {
  // Major Retailers
  'woolworths': 'woolworths.com.au',
  'coles': 'coles.com.au',
  'big w': 'bigw.com.au',
  'kmart': 'kmart.com.au',
  'target': 'target.com.au',
  'bunnings': 'bunnings.com.au',
  'officeworks': 'officeworks.com.au',
  'harvey norman': 'harveynorman.com.au',
  'jb hi fi': 'jbhifi.com.au',
  'david jones': 'davidjones.com',
  'myer': 'myer.com.au',
  
  // Food & Dining
  'mcdonalds': 'mcdonalds.com.au',
  'kfc': 'kfc.com.au',
  'subway': 'subway.com.au',
  'dominos': 'dominos.com.au',
  'pizza hut': 'pizzahut.com.au',
  'hungry jacks': 'hungryjacks.com.au',
  'red rooster': 'redrooster.com.au',
  'nandos': 'nandos.com.au',
  'grilld': 'grilld.com.au',
  'boost juice': 'boostjuice.com.au',
  'guzman y gomez': 'guzmanygomez.com.au',
  'zambrero': 'zambrero.com.au',
  'sushi hub': 'sushihub.com.au',
  'sushi sushi': 'sushisushi.com.au',
  
  // Technology & Services
  'apple': 'apple.com',
  'google': 'google.com',
  'microsoft': 'microsoft.com',
  'amazon': 'amazon.com.au',
  'ebay': 'ebay.com.au',
  'gumtree': 'gumtree.com.au',
  'facebook': 'facebook.com',
  'instagram': 'instagram.com',
  'twitter': 'twitter.com',
  'linkedin': 'linkedin.com',
  'youtube': 'youtube.com',
  'netflix': 'netflix.com',
  'spotify': 'spotify.com',
  'disney': 'disney.com.au',
  'stan': 'stan.com.au',
  'prime video': 'primevideo.com',
  'binge': 'binge.com.au',
  
  // Banking & Finance
  'commonwealth bank': 'commbank.com.au',
  'anz': 'anz.com.au',
  'westpac': 'westpac.com.au',
  'nab': 'nab.com.au',
  'bendigo bank': 'bendigobank.com.au',
  'suncorp': 'suncorp.com.au',
  'ing': 'ing.com.au',
  'macquarie': 'macquarie.com.au',
  'up bank': 'up.com.au',
  'revolut': 'revolut.com',
  'wise': 'wise.com',
  'paypal': 'paypal.com.au',
  'afterpay': 'afterpay.com.au',
  'zip': 'zip.co',
  'klarna': 'klarna.com.au',
  
  // Transport & Travel
  'uber': 'uber.com',
  'uber eats': 'ubereats.com.au',
  'menulog': 'menulog.com.au',
  'deliveroo': 'deliveroo.com.au',
  'doordash': 'doordash.com.au',
  'qantas': 'qantas.com.au',
  'virgin australia': 'virginaustralia.com.au',
  'jetstar': 'jetstar.com.au',
  'tigerair': 'tigerair.com.au',
  'booking.com': 'booking.com',
  'expedia': 'expedia.com.au',
  'airbnb': 'airbnb.com.au',
  'wotif': 'wotif.com',
  'agoda': 'agoda.com.au',
  
  // Utilities & Services
  'telstra': 'telstra.com.au',
  'optus': 'optus.com.au',
  'vodafone': 'vodafone.com.au',
  'tpg': 'tpg.com.au',
  'iinet': 'iinet.net.au',
  'dodo': 'dodo.com.au',
  'origin': 'originenergy.com.au',
  'agl': 'agl.com.au',
  'energy australia': 'energyaustralia.com.au',
  'red energy': 'redenergy.com.au',
  'australia post': 'auspost.com.au',
  'dhl': 'dhl.com.au',
  'fedex': 'fedex.com.au',
  'tnt': 'tnt.com.au',
  'startrack': 'startrack.com.au',
  
  // Health & Fitness
  'chemist warehouse': 'chemistwarehouse.com.au',
  'priceline': 'priceline.com.au',
  'terry white': 'terrywhitechemmart.com.au',
  'amcal': 'amcal.com.au',
  'goodlife': 'goodlifehealthclubs.com.au',
  'anytime fitness': 'anytimefitness.com.au',
  'fitness first': 'fitnessfirst.com.au',
  'jetts': 'jetts.com.au',
  'snap fitness': 'snapfitness.com.au',
  
  // Entertainment & Gaming
  'steam': 'steam.com',
  'playstation': 'playstation.com',
  'xbox': 'xbox.com',
  'nintendo': 'nintendo.com.au',
  'epic games': 'epicgames.com',
  'roblox': 'roblox.com',
  'minecraft': 'minecraft.net',
  'fortnite': 'fortnite.com',
  'twitch': 'twitch.tv',
  'discord': 'discord.com',
  
  // Automotive
  'shell': 'shell.com.au',
  'bp': 'bp.com.au',
  'caltex': 'caltex.com.au',
  '7 eleven': '7eleven.com.au',
  'united petroleum': 'unitedpetroleum.com.au',
  'liberty': 'liberty.com.au',
  'repco': 'repco.com.au',
  'supercheap auto': 'supercheapauto.com.au',
  'autobarn': 'autobarn.com.au',
  
  // Fashion & Beauty
  'cotton on': 'cottonon.com.au',
  'country road': 'countryroad.com.au',
  'witchery': 'witchery.com.au',
  'seed': 'seedheritage.com.au',
  'glassons': 'glassons.com.au',
  'supre': 'supre.com.au',
  'dotti': 'dotti.com.au',
  'portmans': 'portmans.com.au',
  'mimco': 'mimco.com.au',
  'saba': 'saba.com.au',
  'cue': 'cue.com.au',
  'zimmermann': 'zimmermann.com.au',
  'camilla': 'camilla.com.au',
  'seafolly': 'seafolly.com.au',
  'billabong': 'billabong.com.au',
  'quiksilver': 'quiksilver.com.au',
  'rip curl': 'ripcurl.com.au',
  
  // Home & Garden
  'ikea': 'ikea.com.au',
  'freedom': 'freedom.com.au',
  'fantastic furniture': 'fantasticfurniture.com.au',
  'amart': 'amartfurniture.com.au',
  'nick scali': 'nickscali.com.au',
  'plush': 'plush.com.au',
  'bed bath n table': 'bedbathntable.com.au',
  'pillow talk': 'pillowtalk.com.au',
  'adairs': 'adairs.com.au',
  'bed bath beyond': 'bedbathandbeyond.com.au',
  
  // Education & Learning
  'university': 'universitiesaustralia.edu.au',
  'tafe': 'tafe.edu.au',
  'coursera': 'coursera.org',
  'udemy': 'udemy.com',
  'khan academy': 'khanacademy.org',
  'edx': 'edx.org',
  'linkedin learning': 'linkedin.com/learning',
  
  // Government & Services
  'ato': 'ato.gov.au',
  'centrelink': 'servicesaustralia.gov.au',
  'medicare': 'medicare.gov.au',
  'mygov': 'my.gov.au',
  'australian post': 'auspost.com.au',
  'rms': 'service.nsw.gov.au',
  'vic roads': 'vicroads.vic.gov.au',
  'transport sa': 'dpti.sa.gov.au',
  'main roads': 'mainroads.wa.gov.au',
  'transport tasmania': 'transport.tas.gov.au',
  'nt roads': 'nt.gov.au',
  'act government': 'act.gov.au'
};

// Fuzzy matching patterns for common merchant variations
const FUZZY_PATTERNS: Array<{ pattern: RegExp; domain: string }> = [
  // Generic patterns
  { pattern: /\b(woolworths|woolies)\b/i, domain: 'woolworths.com.au' },
  { pattern: /\b(coles|coles express)\b/i, domain: 'coles.com.au' },
  { pattern: /\b(big w|bigw)\b/i, domain: 'bigw.com.au' },
  { pattern: /\b(kmart|k mart)\b/i, domain: 'kmart.com.au' },
  { pattern: /\b(target|target australia)\b/i, domain: 'target.com.au' },
  { pattern: /\b(bunnings|bunnings warehouse)\b/i, domain: 'bunnings.com.au' },
  { pattern: /\b(officeworks|office works)\b/i, domain: 'officeworks.com.au' },
  { pattern: /\b(harvey norman|harveynorman)\b/i, domain: 'harveynorman.com.au' },
  { pattern: /\b(jb hi fi|jbhifi|jb hifi)\b/i, domain: 'jbhifi.com.au' },
  { pattern: /\b(david jones|davidjones)\b/i, domain: 'davidjones.com' },
  
  // Food patterns
  { pattern: /\b(mcdonalds|maccas|mcdonald's)\b/i, domain: 'mcdonalds.com.au' },
  { pattern: /\b(kfc|kentucky fried chicken)\b/i, domain: 'kfc.com.au' },
  { pattern: /\b(subway|subway australia)\b/i, domain: 'subway.com.au' },
  { pattern: /\b(dominos|domino's|domino's pizza)\b/i, domain: 'dominos.com.au' },
  { pattern: /\b(pizza hut|pizzahut)\b/i, domain: 'pizzahut.com.au' },
  { pattern: /\b(hungry jacks|hungryjacks|burger king)\b/i, domain: 'hungryjacks.com.au' },
  { pattern: /\b(red rooster|redrooster)\b/i, domain: 'redrooster.com.au' },
  { pattern: /\b(nandos|nando's)\b/i, domain: 'nandos.com.au' },
  { pattern: /\b(grilld|grill'd)\b/i, domain: 'grilld.com.au' },
  { pattern: /\b(boost juice|boost)\b/i, domain: 'boostjuice.com.au' },
  { pattern: /\b(guzman y gomez|guzman|gyg)\b/i, domain: 'guzmanygomez.com.au' },
  { pattern: /\b(zambrero|zambreros)\b/i, domain: 'zambrero.com.au' },
  { pattern: /\b(sushi hub|sushihub)\b/i, domain: 'sushihub.com.au' },
  { pattern: /\b(sushi sushi|sushisushi)\b/i, domain: 'sushisushi.com.au' },
  
  // Tech patterns
  { pattern: /\b(apple|apple store|apple.com)\b/i, domain: 'apple.com' },
  { pattern: /\b(google|google store)\b/i, domain: 'google.com' },
  { pattern: /\b(microsoft|microsoft store)\b/i, domain: 'microsoft.com' },
  { pattern: /\b(amazon|amazon.com.au)\b/i, domain: 'amazon.com.au' },
  { pattern: /\b(ebay|ebay.com.au)\b/i, domain: 'ebay.com.au' },
  { pattern: /\b(gumtree|gumtree.com.au)\b/i, domain: 'gumtree.com.au' },
  { pattern: /\b(facebook|fb)\b/i, domain: 'facebook.com' },
  { pattern: /\b(instagram|ig)\b/i, domain: 'instagram.com' },
  { pattern: /\b(twitter|x)\b/i, domain: 'twitter.com' },
  { pattern: /\b(linkedin|linkedin.com)\b/i, domain: 'linkedin.com' },
  { pattern: /\b(youtube|yt)\b/i, domain: 'youtube.com' },
  { pattern: /\b(netflix|netflix.com)\b/i, domain: 'netflix.com' },
  { pattern: /\b(spotify|spotify.com)\b/i, domain: 'spotify.com' },
  { pattern: /\b(disney|disney plus|disney+)\b/i, domain: 'disney.com.au' },
  { pattern: /\b(stan|stan.com.au)\b/i, domain: 'stan.com.au' },
  { pattern: /\b(prime video|amazon prime)\b/i, domain: 'primevideo.com' },
  { pattern: /\b(binge|binge.com.au)\b/i, domain: 'binge.com.au' },
  
  // Banking patterns
  { pattern: /\b(commonwealth bank|commbank|cba)\b/i, domain: 'commbank.com.au' },
  { pattern: /\b(anz|australia and new zealand)\b/i, domain: 'anz.com.au' },
  { pattern: /\b(westpac|westpac banking)\b/i, domain: 'westpac.com.au' },
  { pattern: /\b(nab|national australia bank)\b/i, domain: 'nab.com.au' },
  { pattern: /\b(bendigo bank|bendigo)\b/i, domain: 'bendigobank.com.au' },
  { pattern: /\b(suncorp|suncorp bank)\b/i, domain: 'suncorp.com.au' },
  { pattern: /\b(ing|ing bank)\b/i, domain: 'ing.com.au' },
  { pattern: /\b(macquarie|macquarie bank)\b/i, domain: 'macquarie.com.au' },
  { pattern: /\b(up bank|up.com.au)\b/i, domain: 'up.com.au' },
  { pattern: /\b(revolut|revolut.com)\b/i, domain: 'revolut.com' },
  { pattern: /\b(wise|wise.com)\b/i, domain: 'wise.com' },
  { pattern: /\b(paypal|paypal.com.au)\b/i, domain: 'paypal.com.au' },
  { pattern: /\b(afterpay|afterpay.com.au)\b/i, domain: 'afterpay.com.au' },
  { pattern: /\b(zip|zip.co|zip pay)\b/i, domain: 'zip.co' },
  { pattern: /\b(klarna|klarna.com.au)\b/i, domain: 'klarna.com.au' },
  
  // Transport patterns
  { pattern: /\b(uber|uber.com)\b/i, domain: 'uber.com' },
  { pattern: /\b(uber eats|ubereats)\b/i, domain: 'ubereats.com.au' },
  { pattern: /\b(menulog|menulog.com.au)\b/i, domain: 'menulog.com.au' },
  { pattern: /\b(deliveroo|deliveroo.com.au)\b/i, domain: 'deliveroo.com.au' },
  { pattern: /\b(doordash|door dash)\b/i, domain: 'doordash.com.au' },
  { pattern: /\b(qantas|qantas airways)\b/i, domain: 'qantas.com.au' },
  { pattern: /\b(virgin australia|virgin)\b/i, domain: 'virginaustralia.com.au' },
  { pattern: /\b(jetstar|jetstar airways)\b/i, domain: 'jetstar.com.au' },
  { pattern: /\b(tigerair|tiger air)\b/i, domain: 'tigerair.com.au' },
  { pattern: /\b(booking|booking.com)\b/i, domain: 'booking.com' },
  { pattern: /\b(expedia|expedia.com.au)\b/i, domain: 'expedia.com.au' },
  { pattern: /\b(airbnb|air bnb)\b/i, domain: 'airbnb.com.au' },
  { pattern: /\b(wotif|wotif.com)\b/i, domain: 'wotif.com' },
  { pattern: /\b(agoda|agoda.com.au)\b/i, domain: 'agoda.com.au' },
  
  // Utility patterns
  { pattern: /\b(telstra|telstra.com.au)\b/i, domain: 'telstra.com.au' },
  { pattern: /\b(optus|optus.com.au)\b/i, domain: 'optus.com.au' },
  { pattern: /\b(vodafone|vodafone.com.au)\b/i, domain: 'vodafone.com.au' },
  { pattern: /\b(tpg|tpg.com.au)\b/i, domain: 'tpg.com.au' },
  { pattern: /\b(iinet|ii net)\b/i, domain: 'iinet.net.au' },
  { pattern: /\b(dodo|dodo.com.au)\b/i, domain: 'dodo.com.au' },
  { pattern: /\b(origin|origin energy)\b/i, domain: 'originenergy.com.au' },
  { pattern: /\b(agl|agl.com.au)\b/i, domain: 'agl.com.au' },
  { pattern: /\b(energy australia|energyaustralia)\b/i, domain: 'energyaustralia.com.au' },
  { pattern: /\b(red energy|redenergy)\b/i, domain: 'redenergy.com.au' },
  { pattern: /\b(australia post|auspost|australian post)\b/i, domain: 'auspost.com.au' },
  { pattern: /\b(dhl|dhl.com.au)\b/i, domain: 'dhl.com.au' },
  { pattern: /\b(fedex|fedex.com.au)\b/i, domain: 'fedex.com.au' },
  { pattern: /\b(tnt|tnt.com.au)\b/i, domain: 'tnt.com.au' },
  { pattern: /\b(startrack|star track)\b/i, domain: 'startrack.com.au' },
  
  // Health patterns
  { pattern: /\b(chemist warehouse|chemistwarehouse)\b/i, domain: 'chemistwarehouse.com.au' },
  { pattern: /\b(priceline|priceline pharmacy)\b/i, domain: 'priceline.com.au' },
  { pattern: /\b(terry white|terrywhite)\b/i, domain: 'terrywhitechemmart.com.au' },
  { pattern: /\b(amcal|amcal pharmacy)\b/i, domain: 'amcal.com.au' },
  { pattern: /\b(goodlife|goodlife health clubs)\b/i, domain: 'goodlifehealthclubs.com.au' },
  { pattern: /\b(anytime fitness|anytime)\b/i, domain: 'anytimefitness.com.au' },
  { pattern: /\b(fitness first|fitnessfirst)\b/i, domain: 'fitnessfirst.com.au' },
  { pattern: /\b(jetts|jetts fitness)\b/i, domain: 'jetts.com.au' },
  { pattern: /\b(snap fitness|snapfitness)\b/i, domain: 'snapfitness.com.au' },
  
  // Gaming patterns
  { pattern: /\b(steam|steam.com)\b/i, domain: 'steam.com' },
  { pattern: /\b(playstation|psn|playstation network)\b/i, domain: 'playstation.com' },
  { pattern: /\b(xbox|xbox live)\b/i, domain: 'xbox.com' },
  { pattern: /\b(nintendo|nintendo.com.au)\b/i, domain: 'nintendo.com.au' },
  { pattern: /\b(epic games|epic)\b/i, domain: 'epicgames.com' },
  { pattern: /\b(roblox|roblox.com)\b/i, domain: 'roblox.com' },
  { pattern: /\b(minecraft|minecraft.net)\b/i, domain: 'minecraft.net' },
  { pattern: /\b(fortnite|fortnite.com)\b/i, domain: 'fortnite.com' },
  { pattern: /\b(twitch|twitch.tv)\b/i, domain: 'twitch.tv' },
  { pattern: /\b(discord|discord.com)\b/i, domain: 'discord.com' },
  
  // Automotive patterns
  { pattern: /\b(shell|shell.com.au)\b/i, domain: 'shell.com.au' },
  { pattern: /\b(bp|bp.com.au)\b/i, domain: 'bp.com.au' },
  { pattern: /\b(caltex|caltex.com.au)\b/i, domain: 'caltex.com.au' },
  { pattern: /\b(7 eleven|7-eleven|7eleven)\b/i, domain: '7eleven.com.au' },
  { pattern: /\b(united petroleum|united)\b/i, domain: 'unitedpetroleum.com.au' },
  { pattern: /\b(liberty|liberty petroleum)\b/i, domain: 'liberty.com.au' },
  { pattern: /\b(repco|repco.com.au)\b/i, domain: 'repco.com.au' },
  { pattern: /\b(supercheap auto|supercheap)\b/i, domain: 'supercheapauto.com.au' },
  { pattern: /\b(autobarn|auto barn)\b/i, domain: 'autobarn.com.au' },
  
  // Fashion patterns
  { pattern: /\b(cotton on|cottonon)\b/i, domain: 'cottonon.com.au' },
  { pattern: /\b(country road|countryroad)\b/i, domain: 'countryroad.com.au' },
  { pattern: /\b(witchery|witchery.com.au)\b/i, domain: 'witchery.com.au' },
  { pattern: /\b(seed|seed heritage)\b/i, domain: 'seedheritage.com.au' },
  { pattern: /\b(glassons|glassons.com.au)\b/i, domain: 'glassons.com.au' },
  { pattern: /\b(supre|supre.com.au)\b/i, domain: 'supre.com.au' },
  { pattern: /\b(dotti|dotti.com.au)\b/i, domain: 'dotti.com.au' },
  { pattern: /\b(portmans|portmans.com.au)\b/i, domain: 'portmans.com.au' },
  { pattern: /\b(mimco|mimco.com.au)\b/i, domain: 'mimco.com.au' },
  { pattern: /\b(saba|saba.com.au)\b/i, domain: 'saba.com.au' },
  { pattern: /\b(cue|cue.com.au)\b/i, domain: 'cue.com.au' },
  { pattern: /\b(zimmermann|zimmermann.com.au)\b/i, domain: 'zimmermann.com.au' },
  { pattern: /\b(camilla|camilla.com.au)\b/i, domain: 'camilla.com.au' },
  { pattern: /\b(seafolly|seafolly.com.au)\b/i, domain: 'seafolly.com.au' },
  { pattern: /\b(billabong|billabong.com.au)\b/i, domain: 'billabong.com.au' },
  { pattern: /\b(quiksilver|quiksilver.com.au)\b/i, domain: 'quiksilver.com.au' },
  { pattern: /\b(rip curl|ripcurl)\b/i, domain: 'ripcurl.com.au' },
  
  // Home patterns
  { pattern: /\b(ikea|ikea.com.au)\b/i, domain: 'ikea.com.au' },
  { pattern: /\b(freedom|freedom.com.au)\b/i, domain: 'freedom.com.au' },
  { pattern: /\b(fantastic furniture|fantastic)\b/i, domain: 'fantasticfurniture.com.au' },
  { pattern: /\b(amart|amart furniture)\b/i, domain: 'amartfurniture.com.au' },
  { pattern: /\b(nick scali|nickscali)\b/i, domain: 'nickscali.com.au' },
  { pattern: /\b(plush|plush.com.au)\b/i, domain: 'plush.com.au' },
  { pattern: /\b(bed bath n table|bedbathntable)\b/i, domain: 'bedbathntable.com.au' },
  { pattern: /\b(pillow talk|pillowtalk)\b/i, domain: 'pillowtalk.com.au' },
  { pattern: /\b(adairs|adairs.com.au)\b/i, domain: 'adairs.com.au' },
  { pattern: /\b(bed bath beyond|bedbathandbeyond)\b/i, domain: 'bedbathandbeyond.com.au' },
  
  // Education patterns
  { pattern: /\b(university|uni)\b/i, domain: 'universitiesaustralia.edu.au' },
  { pattern: /\b(tafe|tafe.edu.au)\b/i, domain: 'tafe.edu.au' },
  { pattern: /\b(coursera|coursera.org)\b/i, domain: 'coursera.org' },
  { pattern: /\b(udemy|udemy.com)\b/i, domain: 'udemy.com' },
  { pattern: /\b(khan academy|khanacademy)\b/i, domain: 'khanacademy.org' },
  { pattern: /\b(edx|edx.org)\b/i, domain: 'edx.org' },
  { pattern: /\b(linkedin learning|linkedin\.com\/learning)\b/i, domain: 'linkedin.com' },
  
  // Government patterns
  { pattern: /\b(ato|australian tax office)\b/i, domain: 'ato.gov.au' },
  { pattern: /\b(centrelink|services australia)\b/i, domain: 'servicesaustralia.gov.au' },
  { pattern: /\b(medicare|medicare.gov.au)\b/i, domain: 'medicare.gov.au' },
  { pattern: /\b(mygov|my.gov.au)\b/i, domain: 'my.gov.au' },
  { pattern: /\b(australian post|auspost|australia post)\b/i, domain: 'auspost.com.au' },
  { pattern: /\b(rms|roads and maritime)\b/i, domain: 'service.nsw.gov.au' },
  { pattern: /\b(vic roads|vicroads)\b/i, domain: 'vicroads.vic.gov.au' },
  { pattern: /\b(transport sa|dpti)\b/i, domain: 'dpti.sa.gov.au' },
  { pattern: /\b(main roads|mainroads)\b/i, domain: 'mainroads.wa.gov.au' },
  { pattern: /\b(transport tasmania|transport.tas)\b/i, domain: 'transport.tas.gov.au' },
  { pattern: /\b(nt roads|nt.gov.au)\b/i, domain: 'nt.gov.au' },
  { pattern: /\b(act government|act.gov.au)\b/i, domain: 'act.gov.au' }
];

// Logo cache for performance
const LOGO_CACHE = new Map<string, { url: string; timestamp: number; valid: boolean }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Multiple logo sources for fallback
const LOGO_SOURCES = [
  (domain: string) => `https://logo.clearbit.com/${domain}?size=256`,
  (domain: string) => `https://icon.horse/icon/${domain}`,
  (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
  (domain: string) => `https://favicons.githubusercontent.com/${domain}`,
  (domain: string) => `https://api.statvoo.com/logo/${domain}`
];

export function normalize(input: string | undefined): string {
  return (input || '')
    .toLowerCase()
    .replace(/[_*]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Cache management functions
function getCachedLogo(domain: string): { url: string; valid: boolean } | null {
  const cached = LOGO_CACHE.get(domain);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    LOGO_CACHE.delete(domain);
    return null;
  }
  
  return { url: cached.url, valid: cached.valid };
}

function setCachedLogo(domain: string, url: string, valid: boolean = true): void {
  LOGO_CACHE.set(domain, {
    url,
    timestamp: Date.now(),
    valid
  });
}

// Local storage overrides
function getLocalOverride(normalized: string): string | undefined {
  try {
    const raw = localStorage.getItem('merchantLogoOverrides');
    if (!raw) return undefined;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[normalized];
  } catch {
    return undefined;
  }
}

export function setLocalOverride(label: string, logoUrl: string) {
  try {
    const normalized = normalize(label);
    const raw = localStorage.getItem('merchantLogoOverrides');
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[normalized] = logoUrl;
    localStorage.setItem('merchantLogoOverrides', JSON.stringify(map));
  } catch (error) {
    ErrorLogger.logError('merchantLogos.setLocalOverride', error, { label, logoUrl });
  }
}

export function clearLocalOverride(label: string) {
  try {
    const normalized = normalize(label);
    const raw = localStorage.getItem('merchantLogoOverrides');
    if (!raw) return;
    const map = JSON.parse(raw) as Record<string, string>;
    delete map[normalized];
    localStorage.setItem('merchantLogoOverrides', JSON.stringify(map));
  } catch (error) {
    ErrorLogger.logError('merchantLogos.clearLocalOverride', error, { label });
  }
}

// Logo validation function
async function validateLogoUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return response.ok || response.type === 'opaque'; // opaque means CORS blocked but likely valid
  } catch {
    return false;
  }
}

// Background logo preloader
export async function preloadLogos(domains: string[]): Promise<void> {
  const promises = domains.map(async (domain) => {
    if (getCachedLogo(domain)) return; // Already cached
    
    for (const source of LOGO_SOURCES) {
      const url = source(domain);
      const isValid = await validateLogoUrl(url);
      if (isValid) {
        setCachedLogo(domain, url, true);
        break;
      }
    }
  });
  
  await Promise.allSettled(promises);
}

// Optimized domain resolution with multiple strategies
export function resolveMerchantDomain(description?: string, rawText?: string): string | undefined {
  const nDesc = normalize(description);
  const nRaw = normalize(rawText);
  const combined = `${nDesc} ${nRaw}`.trim();

  // 1) Local override (highest priority)
  const override = getLocalOverride(combined) || getLocalOverride(nRaw) || getLocalOverride(nDesc);
  if (override) {
    try {
      const url = new URL(override);
      return url.hostname;
    } catch {
      return override;
    }
  }

  // 2) Exact database match
  for (const [merchant, domain] of Object.entries(MERCHANT_DATABASE)) {
    if (combined.includes(merchant)) return domain;
  }

  // 3) Fuzzy pattern matching
  for (const { pattern, domain } of FUZZY_PATTERNS) {
    if (pattern.test(combined)) return domain;
  }

  // 4) Extract domain from raw text
  const domainMatch = combined.match(/([a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?)/i);
  if (domainMatch && domainMatch[1]) return domainMatch[1];

  // 5) Try to extract from common patterns
  const commonPatterns = [
    /([a-z0-9-]+\.com\.au)/i,
    /([a-z0-9-]+\.com)/i,
    /([a-z0-9-]+\.org)/i,
    /([a-z0-9-]+\.net)/i,
    /([a-z0-9-]+\.gov\.au)/i
  ];
  
  for (const pattern of commonPatterns) {
    const match = combined.match(pattern);
    if (match && match[1]) return match[1];
  }

  return undefined;
}

// Optimized logo resolution with caching and fallbacks
export function resolveMerchantLogo(description?: string, rawText?: string): string | undefined {
  const domain = resolveMerchantDomain(description, rawText);
  if (!domain) return undefined;

  // Check cache first
  const cached = getCachedLogo(domain);
  if (cached && cached.valid) return cached.url;

  // Return primary source (will be validated in real-time)
  const primaryUrl = LOGO_SOURCES[0](domain);
  setCachedLogo(domain, primaryUrl, true);
  return primaryUrl;
}

// Real-time logo validation and fallback
export async function resolveMerchantLogoWithFallback(description?: string, rawText?: string): Promise<string | undefined> {
  const domain = resolveMerchantDomain(description, rawText);
  if (!domain) return undefined;

  // Check cache first
  const cached = getCachedLogo(domain);
  if (cached && cached.valid) return cached.url;

  // Try each source until one works
  for (const source of LOGO_SOURCES) {
    const url = source(domain);
    const isValid = await validateLogoUrl(url);
    if (isValid) {
      setCachedLogo(domain, url, true);
      return url;
    }
  }

  // If all sources fail, cache the failure
  setCachedLogo(domain, LOGO_SOURCES[0](domain), false);
  return undefined;
}

// Batch logo resolution for performance
export async function resolveMerchantLogosBatch(transactions: Array<{ description?: string; rawText?: string }>): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const domains = new Set<string>();
  
  // Collect all unique domains
  transactions.forEach(tx => {
    const domain = resolveMerchantDomain(tx.description, tx.rawText);
    if (domain) domains.add(domain);
  });

  // Preload all logos
  await preloadLogos(Array.from(domains));

  // Resolve logos for each transaction
  transactions.forEach(tx => {
    const domain = resolveMerchantDomain(tx.description, tx.rawText);
    if (domain) {
      const cached = getCachedLogo(domain);
      if (cached && cached.valid) {
        results.set(`${tx.description}|${tx.rawText}`, cached.url);
      }
    }
  });

  return results;
}

// Clear cache function
export function clearLogoCache(): void {
  LOGO_CACHE.clear();
}

// Get cache statistics
export function getCacheStats(): { size: number; domains: string[] } {
  return {
    size: LOGO_CACHE.size,
    domains: Array.from(LOGO_CACHE.keys())
  };
}


