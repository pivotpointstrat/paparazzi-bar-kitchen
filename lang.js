// Khmer language layer.
//
// English stays the default (that is the audience); Khmer is a switch for
// Khmer-speaking customers. Rather than duplicating six pages of markup, this
// swaps the text of existing nodes using a dictionary the model produced —
// no HTML is restructured, and switching back restores the original text
// exactly.
//
// The Khmer was machine-translated and has NOT been reviewed by a native
// speaker. Tone and phrasing should be checked before it is treated as final.
(function () {
  var MAP = {
 "Paparazzi": "Paparazzi",
 "Bar &": "បារ &",
 "Kitchen": "ផ្ទះបាយ",
 "Home": "ទំព័រដើម",
 "Menu": "ម៉ឺនុយ",
 "About": "អំពីយើង",
 "Gallery": "រូបភាព",
 "Contact": "ទំនាក់ទំនង",
 "Book a Table": "កក់តុ",
 "Riverside · Phnom Penh": "មាត់ទន្លេ · ភ្នំពេញ",
 "Every table is a": "រាល់តុគឺជា",
 "front-row seat": "កន្លែងអង្គុយជួរមុខ",
 "View Menu": "មើលម៉ឺនុយ",
 "The Highlights": "ចំណុចលេចធ្លោ",
 "Four reasons to pull up a chair": "ហេតុផលបួនយ៉ាងដើម្បីអង្គុយចុះ",
 "Comfort Food": "អាហារសម្រាប់ចិត្ត",
 "Slow-cooked ribs, house lasagna, steak & Guinness pie — made from scratch.": "ឆ្អឹងជំនីរដុតយឺតៗ ឡាសាញ៉ារបស់ផ្ទះ សាច់គោ និងភី Guinness — ធ្វើដោយដៃផ្ទាល់។",
 "Steaks & Grill": "សាច់គោ និងអាំង",
 "Australian beef and a $88 Tomahawk, cooked to order over the flame.": "សាច់គោអូស្ត្រាលី និង Tomahawk តម្លៃ $88 ដុតតាមការបញ្ជាទិញលើភ្លើង។",
 "24 Cocktails · $5": "កុកតែល 24 មុខ · $5",
 "A full cocktail list, plus draught and imported beers and wine.": "បញ្ជីកុកតែលពេញលេញ ព្រមទាំងស្រាបៀរស្រស់ និងស្រាបៀរនាំចូល និងស្រាទំពាំងបាយជូរ។",
 "Cigar Lounge": "បន្ទប់ស៊ីហ្គា",
 "The Menu": "ម៉ឺនុយ",
 "Ten categories, eighty dishes": "ដប់ប្រភេទ ប៉ែតសិបមុខម្ហូប",
 "Explore the full menu": "រុករកម៉ឺនុយពេញលេញ",
 "Reservations": "ការកក់តុ",
 "Your table is waiting": "តុរបស់អ្នកកំពុងរង់ចាំ",
 "Open Mon – Sat, 11am – 11pm. Book online, or call": "បើកចន្ទ – សៅរ៍ ម៉ោង 11 ព្រឹក – 11 យប់។ កក់តាមអ៊ីនធឺណិត ឬទូរស័ព្ទមក",
 "Reserve Now": "កក់ឥឡូវនេះ",
 "Connect": "ភ្ជាប់ទំនាក់ទំនង",
 "Follow & chat with us": "តាមដាន និងជជែកជាមួយយើង",
 "Message us on Facebook, Messenger, or Telegram — or just call.": "ផ្ញើសារមកយើងតាម Facebook, Messenger ឬ Telegram — ឬទូរស័ព្ទមកក៏បាន។",
 "Facebook": "Facebook",
 "Messenger": "Messenger",
 "Telegram": "Telegram",
 "Call": "ទូរស័ព្ទ",
 "Visit": "មកកាន់",
 "179 E0 Preah Sisowath Quay,": "179 E0 ព្រះស៊ីសុវត្ថិ ខួច,",
 "Phnom Penh, Cambodia": "ភ្នំពេញ, កម្ពុជា",
 "Hours": "ម៉ោងបើក",
 "Mon – Sat: 11:00 AM – 11:00 PM": "ចន្ទ – សៅរ៍: 11:00 ព្រឹក – 11:00 យប់",
 "Closed Sunday": "បិទថ្ងៃអាទិត្យ",
 "Explore": "រុករក",
 "© 2026 Paparazzi Bar & Kitchen. All rights reserved.": "© 2026 Paparazzi Bar & Kitchen។ រក្សាសិទ្ធិគ្រប់បែបយ៉ាង។",
 "Paparazzi Assistant": "ជំនួយការ Paparazzi",
 "Send": "ផ្ញើ",
 "Steak, seafood & pub comfort — plus": "ស្តេក អាហារសមុទ្រ និងម្ហូបផាប់ — ព្រមទាំង",
 "Khmer classics": "ម្ហូបខ្មែរបុរាណ",
 "Small Plates": "ម្ហូបតូច",
 "Birria Tacos": "តាកូស Birria",
 "Home baked tortilla bread, slow-cooked marinated beef, plenty of mozzarella. Min order 2pcs.": "នំតូទីឡាដុតនំនៅផ្ទះ សាច់គោចំអិនយូរជាមួយទឹកជ្រលក់ និងឈីសម៉ូហ្សារ៉េឡាច្រើន។ កម្មង់អប្បបរមា 2 ដុំ។",
 "Red Braised Pork Belly": "សាច់ជ្រូកបីជាន់ដុតពណ៌ក្រហម",
 "Slow cooked and full of flavor. Served with rice.": "ចំអិនយូរ និងរសជាតិពេញលេញ។ បរិភោគជាមួយបាយ។",
 "Bruschetta Cured Salmon Gravlax / Skagen Seafood Mix": "នំបុ័ង Bruschetta ជាមួយសាច់ត្រីសាម៉ុន Gravlax / លាយអាហារសមុទ្រ Skagen",
 "Choose cured Salmon Gravlax or Skagen seafood mix.": "ជ្រើសរើសសាច់ត្រីសាម៉ុន Gravlax ឬលាយអាហារសមុទ្រ Skagen។",
 "Paparazzi Fries Bowl": "ចានដំឡូងបារាំង Paparazzi",
 "Mayo and ketchup on the side.": "ម៉ាយ៉ូ និងគេជីបនៅខាងក្រៅ។",
 "Olive Tapenade Mix Plate": "ចានលាយ Olive Tapenade",
 "Tapenade, bread, crackers, salami and aged Cheddar.": "Tapenade នំបុ័ង នំកែកឃី សាឡាមី និងឈីស Cheddar ចាស់។",
 "Swedish Meatballs (Snack Size)": "គ្រាប់សាច់ស៊ុយអែត (ទំហំអាហារសម្រន់)",
 "Authentic Swedish recipe with mashed potatoes, cream sauce, lingonberries, pickled cucumber.": "រូបមន្តស៊ុយអែតពិតប្រាកដ ជាមួយដំឡូងបុក ទឹកក្រែម ផ្លែលីងហ្គុនបឺរី និងត្រសក់ជ្រលក់។",
 "Saffron & White Wine Steamed Mussel Soup (Snack Size)": "ស៊ុបគ្រាប់ខ្យងចំហុយជាមួយ Saffron និងស្រាស។ (ទំហំអាហារសម្រន់)",
 "Served with garlic bread.": "បរិភោគជាមួយនំបុ័ងខ្ទឹមស។",
 "Tasty Garlic & Butter Shrimp Skillet": "ខ្ទះបង្គា ខ្ទឹមស និងប៊ឺឆ្ងាញ់",
 "Marinated shrimp, oven baked with herbs and butter.": "បង្គាជ្រលក់ ដុតក្នុងឡជាមួយឱសថ និងប៊ឺ។",
 "Beef Carpaccio": "សាច់គោ Carpaccio",
 "Topped with rocket salad, Parmesan cheese and capers.": "ដាក់សាឡាត់ rocket ឈីស Parmesan និង capers ពីលើ។",
 "Grilled Salmon Fins": "ព្រុយត្រីសាម៉ុនអាំង",
 "Marinated and grilled salmon fins. A delicacy!": "ព្រុយត្រីសាម៉ុនជ្រលក់ និងអាំង។ ជាអាហារឆ្ងាញ់ពិសេស!",
 "Salmon Krolok": "ត្រីសាម៉ុន Krolok",
 "Salmon salad, Khmer style, spicy!": "សាឡាត់ត្រីសាម៉ុន បែបខ្មែរ ហឹរ!",
 "Salads": "សាឡាត់",
 "Chicken Caesar Salad": "សាឡាត់ Caesar សាច់មាន់",
 "Fresh Romaine, creamy Caesar dressing, hand-breaded crispy chicken.": "សាឡាត់ Romaine ស្រស់ ទឹកជ្រលក់ Caesar ក្រែម និងសាច់មាន់ក្រៀមស្រួយធ្វើដោយដៃ។",
 "Fresh Tuna Salad": "សាឡាត់ត្រីធូណាស្រស់",
 "Seared tuna over greens with cucumber, tomato, olives, lemon-olive oil dressing.": "ត្រីធូណាដុតពីលើបន្លែខៀវ ជាមួយត្រសក់ ប៉េងប៉ោះ អូលីវ និងទឹកជ្រលក់ក្រូចឆ្មារប្រេងអូលីវ។",
 "Burrata & Parma Ham Salad": "សាឡាត់ Burrata និង Parma Ham",
 "Creamy burrata, Parma ham, arugula, cherry tomatoes, balsamic glaze.": "Burrata ក្រែម Parma ham arugula ប៉េងប៉ោះឆ្នាំង និងទឹក balsamic។",
 "Zesty Lime Shrimp & Avocado Salad": "សាឡាត់បង្គា និងអាវ៉ូកាដូជាមួយក្រូចឆ្មារ",
 "Lime-marinated shrimp, avocado, greens and veggies with tangy vinaigrette.": "បង្គាជ្រលក់ក្រូចឆ្មារ អាវ៉ូកាដូ បន្លែខៀវ និងបន្លែផ្សេងៗ ជាមួយទឹក vinaigrette ជូរអែម។",
 "Khmer & Asian Dishes": "ម្ហូបខ្មែរ និងអាស៊ី",
 "Beef Lok Lak": "គោឡុកឡាក់",
 "Cambodian national dish, made using high-quality imported beef tenderloin.": "ម្ហូបជាតិកម្ពុជា ធ្វើពីសាច់គោក្រោមចង្កេះនាំចូលគុណភាពខ្ពស់។",
 "Fried Noodles": "គុយទាវឆា",
 "With beef or chicken, pâté, and chili sauce.": "ជាមួយសាច់គោ ឬសាច់មាន់ ប៉ាតេ និងទឹកម្ទេស។",
 "Grilled Cambodian Beef with Prohok": "សាច់គោអាំងខ្មែរជាមួយប្រហុក",
 "High-quality imported beef tenderloin with a spicy, lemon-infused, nutty, creamy sauce.": "សាច់គោក្រោមចង្កេះនាំចូលគុណភាពខ្ពស់ ជាមួយទឹកជ្រលក់ហឹរ ក្រអូបជូរក្រូច និងគ្រាប់សណ្តែក។",
 "Khmer Beef Salad": "ញាំសាច់គោខ្មែរ",
 "Pan-seared imported beef tenderloin with mixed herbs and sweet chili galangal sauce.": "សាច់គោក្រោមចង្កេះនាំចូលឆា ជាមួយបន្លែផ្សំ និងទឹកម្ទេសផ្អែមខ្ញី។",
 "Green Mango Salad with Dried Shrimps": "ញាំស្វាយខ្ចីជាមួយបង្គាំងោ",
 "Smoked fish, green mango, dried shrimp, fresh herbs, peanuts, and sweet chili sauce.": "ត្រីជក់ផ្សែង ស្វាយខ្ចី បង្គាំងោ បន្លែស្រស់ សណ្តែកដី និងទឹកម្ទេសផ្អែម។",
 "Pub Menu": "ម៉ឺនុយផាប់",
 "English Muffin with Fries": "នំម៉ាហ្វីនអង់គ្លេសជាមួយដំឡូងបារាំង",
 "Home baked muffin with bacon, egg and cheese.": "នំម៉ាហ្វីនដុតនៅផ្ទះ ជាមួយសាច់បេខុន ពងមាន់ និងឈីស។",
 "Steak & Guinness Pie": "ភីស្តេក និងហ្គីនណេស",
 "400g pie, served with fries or mashed potatoes and gravy.": "ភីទម្ងន់ 400ក្រាម ជាមួយដំឡូងបារាំង ឬដំឡូងបុក និងទឹកក្រៀមសាច់។",
 "Beef Stew in a Yorkie": "ស៊ុបសាច់គោក្នុងនំយ៉កឃឺ",
 "Slow cooked beef chuck served in a Yorkshire pudding.": "សាច់គោចម្អិនយូរ ដាក់ក្នុងនំភីយ៉កឃឺ។",
 "Fish & Chips": "ត្រី និងដំឡូងបារាំង",
 "Crispy beer battered Hoki fillet, fries, mushy peas, tartar sauce.": "សាច់ត្រីហូគីក្រោបម្សៅស្រាបៀរចៀនក្រៀម ដំឡូងបារាំង សណ្តែកបារាំងបុក និងទឹកតាតា។",
 "Jacked Potato (Skagen or Chili Con Carne)": "ដំឡូងបារាំងដុត (ស្កាហ្គេន ឬឈីលីខនការនេ)",
 "Choose filling: Skagen seafood mix or chili con carne.": "ជ្រើសរើសសាច់ដាក់៖ លាយគ្រឿងសមុទ្រស្កាហ្គេន ឬឈីលីខនការនេ។",
 "Bangers & Mash in a Yorkie": "សាច់ក្រក និងដំឡូងបុកក្នុងនំយ៉កឃឺ",
 "Big Cumberland sausage on mashed potatoes and onion gravy in a Yorkshire pudding.": "សាច់ក្រកខាំបឺឡេនដ៏ធំ លើដំឡូងបុក និងទឹកក្រៀមខ្ទឹមបារាំង ក្នុងនំភីយ៉កឃឺ។",
 "Cold Cut Platters": "ចានសាច់ត្រជាក់",
 "Medium Platter": "ចានមធ្យម",
 "Two meats, two cheeses, bread, crackers and fruit.": "សាច់ពីរមុខ ឈីសពីរមុខ នំបុ័ង នំក្រែក និងផ្លែឈើ។",
 "Large Platter": "ចានធំ",
 "Four meats, four cheeses, bread, crackers and fruit.": "សាច់បួនមុខ ឈីសបួនមុខ នំបុ័ង នំក្រែក និងផ្លែឈើ។",
 "Pastas": "ប៉ាស្តា",
 "Spicy Thai Drunken Seafood Spaghetti": "ស្ពាហ្គេតទីគ្រឿងសមុទ្រហឹរ",
 "Shrimp, squid and mussels mixed in a spicy sauce.": "បង្គា មឹក និងខ្យង លាយជាមួយទឹកជ្រលក់ហឹរ។",
 "House Spaghetti Bolognese": "ស្ពាហ្គេតបូឡូញែស",
 "Bolognese sauce simmered for hours. Served with garlic bread.": "ទឹកជ្រលក់បូឡូញែសដាំយូរម៉ោង។ ជាមួយនំបុ័ងខ្ទឹមស។",
 "Papa's Creamy Beef Tenderloin Pasta": "ប៉ាស្តាសាច់គោក្រោមចង្កេះគ្រីមរបស់ប៉ាប៉ា",
 "Canadian tenderloin, penne pasta, creamy sauce, garlic bread.": "សាច់គោក្រោមចង្កេះកាណាដា ប៉ាស្តាប៉េនណេ ទឹកជ្រលក់គ្រីម និងនំបុ័ងខ្ទឹមស។",
 "Homemade Beef Lasagna": "ឡាសាញ៉ាសាច់គោធ្វើនៅផ្ទះ",
 "Our super popular lasagna. Served with garlic bread and side salad.": "ឡាសាញ៉ាពេញនិយមបំផុតរបស់យើង។ ជាមួយនំបុ័ងខ្ទឹមស និងសាឡាត់។",
 "Lobster Pasta": "ប៉ាស្តាបង្គាបំពង់",
 "Creamy lobster seafood au gratin served with spaghetti.": "បង្គាបំពង់គ្រីមដុតឈីស ជាមួយស្ពាហ្គេត។",
 "From the Grill": "ពីចង្ក្រានអាំង",
 "Slow Cooked Ribs in BBQ Sauce": "ឆ្អឹងជំនីរដុតយឺតៗជាមួយទឹកជ្រលក់បាបេឃ្យូ",
 "Tender, slow-cooked ribs finished on the BBQ. Sides: potato gratin, fries, roasted potatoes, or baked potato.": "ឆ្អឹងជំនីរទន់ ដុតយឺតៗ រួចដុតលើចង្ក្រានបាបេឃ្យូ។ ម្ហូបអម៖ ដំឡូងដុតជាមួយឈីស ដំឡូងបំពង ដំឡូងដុត ឬដំឡូងដុតក្នុងឡ។",
 "BR Tenderloin 200g": "សាច់គោចំណុចកណ្តាល BR 200ក្រាម",
 "Cooked to order, choice of side, pepper sauce and bearnaise sauce.": "ចម្អិនតាមការបញ្ជាទិញ ជ្រើសរើសម្ហូបអម ទឹកជ្រលក់ម្រេច និងទឹកជ្រលក់បេអាណេស។",
 "CA Grade AAA Tenderloin 200g": "សាច់គោចំណុចកណ្តាល CA ថ្នាក់ AAA 200ក្រាម",
 "CA Grade AAA Rib Eye 330g": "សាច់គោឆ្អឹងជំនីរ CA ថ្នាក់ AAA 330ក្រាម",
 "AU Tomahawk Steak 1.25kg": "ស្តេក Tomahawk AU 1.25គីឡូក្រាម",
 "Roasted potatoes, baby carrots, two sauces. Serves 3-4. Longer cook time if not pre-ordered.": "ដំឡូងដុត ការ៉ុតតូច ទឹកជ្រលក់ពីរមុខ។ សម្រាប់ 3-4 នាក់។ ចំណាយពេលចម្អិនយូរជាងបើមិនបញ្ជាទិញជាមុន។",
 "Surf & Turf": "សាច់គោ និងបង្គា",
 "Cooked to order steak and prawns, roasted potatoes, pepper sauce and bearnaise sauce.": "ស្តេក និងបង្គាចម្អិនតាមការបញ្ជាទិញ ដំឡូងដុត ទឹកជ្រលក់ម្រេច និងទឹកជ្រលក់បេអាណេស។",
 "Burgers": "បឺហ្គឺ",
 "Double Trouble Cheese Burger": "បឺហ្គឺឈីសពីរស្រទាប់",
 "Big Bacon & Cheese": "បេខុន និងឈីសធំ",
 "Double-decker Australian beef burger, smoked bacon, cheese, lettuce, pickles, house sauce. Fries & coleslaw.": "បឺហ្គឺសាច់គោអូស្ត្រាលីពីរស្រទាប់ បេខុនជក់ ឈីស សាឡាត់ ត្រសក់ជ្រលក់ ទឹកជ្រលក់ផ្ទះ។ ដំឡូងបំពង និងសាឡាត់ស្ពៃក្តោប។",
 "Paparazzi Gourmet Burger": "បឺហ្គឺហ្គូមេ Paparazzi",
 "From the Sea": "ពីសមុទ្រ",
 "Saffron & White Wine Steamed Mussel Soup": "ស៊ុបគ្រំចំហុយជាមួយ Saffron និងស្រាស។",
 "Cured Salmon Gravlax": "ត្រីសាម៉ុនជ្រលក់ Gravlax",
 "Cured with herbs, classic Scandinavian way. Served with dill infused potatoes.": "ជ្រលក់ជាមួយឱសថ តាមរបៀបស្កង់ឌីណាវីបុរាណ។ បម្រើជាមួយដំឡូងដាក់ជីរ។",
 "Pan-Seared Seabass on Ratatouille": "ត្រីសេបាសចៀនលើខ្ទះជាមួយ Ratatouille",
 "Chef's own ratatouille recipe. Served with garlic bread.": "រូបមន្ត Ratatouille ផ្ទាល់ខ្លួនរបស់ចុងភៅ។ បម្រើជាមួយនំបុ័ងខ្ទឹមស។",
 "Grilled Salmon Fillet": "សាច់ត្រីសាម៉ុនអាំង",
 "Grilled to perfection, mashed potatoes and hollandaise sauce.": "អាំងយ៉ាងល្អឥតខ្ចោះ ដំឡូងបុក និងទឹកជ្រលក់ hollandaise។",
 "Coconut & Lime Marinated Seabass Fillet": "សាច់ត្រីសេបាសជ្រលក់ដូង និងក្រូចឆ្មារ",
 "Served with avocado salsa and pumpkin puree.": "បម្រើជាមួយសាឡាត់ផ្លែប័រ និងផ្លែល្ពៅបុក។",
 "Moules-Frites": "គ្រំ និងដំឡូងបំពង",
 "Sautéed mussels in white wine, shallots and herbs. Served with fries and Dijon mayo.": "គ្រំឆា ជាមួយស្រាស ខ្ទឹមបារាំង និងឱសថ។ បម្រើជាមួយដំឡូងបំពង និងម៉ាយូឌីហ្សុង។",
 "Fresh Water Fish in Orange Sauce": "ត្រីទឹកសាបជាមួយទឹកជ្រលក់ក្រូច",
 "Pan-seared fish in a bright sweet-tart orange sauce. Served with rice.": "ត្រីចៀនលើខ្ទះជាមួយទឹកជ្រលក់ក្រូចផ្អែមជូរ។ បម្រើជាមួយបាយ។",
 "Coconut Fish Soup with Lemongrass & Fresh Curry Leaves": "ស៊ុបត្រីដូងជាមួយស្លឹកគ្រៃ និងស្លឹកជីរបន្លែស្រស់",
 "Flavorful and comforting soup with a hint of the tropics. Served with rice.": "ស៊ុបរសជាតិឆ្ងាញ់ និងកក់ក្តៅ ជាមួយក្លិនឈ្ងុយនៃតំបន់ត្រូពិច។ បម្រើជាមួយបាយ។",
 "Desserts": "បង្អែម",
 "Sticky Chocolate Cake with Whipped Cream": "នំសូកូឡាស្អិតជាមួយក្រែមវាយ",
 "Lemon Curd Meringue Cake with Ice Cream": "នំក្រូចឆ្មារ Meringue ជាមួយការ៉េម",
 "Ice Cream Bowl (Three Scoops)": "ចានការ៉េម (បីស្កូប)",
 "Vanilla, chocolate, or strawberry.": "វ៉ានីឡា សូកូឡា ឬស្ត្របឺរី។",
 "Apple Crumble Pie with Vanilla Custard": "នំផ្លែប៉ោម Crumble ជាមួយក្រែមវ៉ានីឡា",
 "Paparazzi's Milkshake": "មីលក់សេ Paparazzi",
 "A proper milkshake — plenty of ice cream and milk.": "មីលក់សេពិតប្រាកដ — ការ៉េម និងទឹកដោះគោច្រើន។",
 "Cocktails ($5 each unless noted)": "កុកតេល ($5 ក្នុងមួយ លើកលែងបញ្ជាក់)",
 "Singapore Sling": "Singapore Sling",
 "Old Fashioned": "Old Fashioned",
 "Pina Colada": "Pina Colada",
 "Whiskey Sour": "Whiskey Sour",
 "Aperol Spritz": "Aperol Spritz",
 "Wild Old Man": "Wild Old Man",
 "Limoncello Spritz": "Limoncello Spritz",
 "Dr Olli": "Dr Olli",
 "Espresso Martini": "Espresso Martini",
 "Frangelico Lime": "Frangelico Lime",
 "Passion Martini": "Passion Martini",
 "Long Island Iced Tea": "Long Island Iced Tea",
 "Passion Mojito": "Passion Mojito",
 "White Russian": "White Russian",
 "Passion Lychee": "Passion Lychee",
 "Green Elevator": "Green Elevator",
 "Margarita": "Margarita",
 "Smoothie Bowl": "Smoothie Bowl",
 "Mojito": "Mojito",
 "Don't Think I'm Forgotten": "Don't Think I'm Forgotten",
 "Caipirinha": "Caipirinha",
 "Sex on the Bed": "Sex on the Bed",
 "Negroni": "Negroni",
 "Irish Coffee": "Irish Coffee",
 "Beer": "ស្រាបៀរ",
 "Cambodia Draught": "Cambodia Draught",
 "Chang Bottle": "Chang Bottle",
 "Heineken Bottle": "Heineken Bottle",
 "Tiger Crystal Bottle": "Tiger Crystal Bottle",
 "Corona Bottle": "Corona Bottle",
 "Guinness Draught Can (Widget)": "Guinness Draught Can (Widget)",
 "Botanico Brewing: Centurion American Pale Ale": "Botanico Brewing: Centurion American Pale Ale",
 "Botanico Brewing: Splash IPA": "Botanico Brewing: Splash IPA",
 "Botanico Brewing: Beer of the Month": "Botanico Brewing: Beer of the Month",
 "Fuzzy Logic: Celestial Blonde": "Fuzzy Logic: Celestial Blonde",
 "Fuzzy Logic: John Lemon Hard Lemonade": "Fuzzy Logic: John Lemon Hard Lemonade",
 "Our Story": "រឿងរ៉ាវរបស់យើង",
 "A riverside hideaway with a": "កន្លែងសម្ងាត់ក្បែរមាត់ទន្លេដែលមាន",
 "camera-flash": "camera-flash",
 "soul": "ព្រលឹង",
 "Food": "អាហារ",
 "Drinks": "ភេសជ្ជៈ",
 "Atmosphere": "បរិយាកាស",
 "The Cigar Lounge": "ឡាន់ស៊ីហ្គា",
 "Upstairs, unwind": "ឡើងទៅខាងលើ សម្រាកលំហែ",
 "A taste of the": "រសជាតិនៃ",
 "atmosphere": "បរិយាកាស",
 "Find Us": "រកយើងឃើញ",
 "On the Riverside": "នៅរីវ័រសាយ",
 "Address": "អាសយដ្ឋាន",
 "Phone": "ទូរស័ព្ទ",
 "Follow": "តាមដាន",
 "facebook.com/PaparazziPP": "facebook.com/PaparazziPP",
 "Messenger — chat with us": "Messenger — ជជែកជាមួយយើង",
 "Telegram — @Paparazzi_kitchen_bot": "Telegram — @Paparazzi_kitchen_bot",
 "Book a table": "កក់តុ",
 "Name": "ឈ្មោះ",
 "Date": "កាលបរិច្ឆេទ",
 "Time": "ម៉ោង",
 "Select time": "ជ្រើសរើសម៉ោង",
 "Party size": "ចំនួនអ្នក",
 "Select": "ជ្រើសរើស",
 "9+ (group)": "9+ (ក្រុម)",
 "Occasion (optional)": "ឱកាស (ស្រេចចិត្ត)",
 "Special requests (optional)": "សំណើពិសេស (ស្រេចចិត្ត)",
 "Request Reservation": "ស្នើសុំកក់តុ",
 "Prefer to ask a question first? Message us on": "ចង់សួរសំណួរមុនទេ? ផ្ញើសារមកយើងតាម",
 "— or call": "— ឬទូរស័ព្ទមក"
};

  var original = new Map();      // node -> its English text
  var showingKhmer = false;
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1 };

  function walk(cb) {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (!n.parentNode || SKIP[n.parentNode.nodeName]) return NodeFilter.FILTER_REJECT;
        if (n.parentNode.classList && n.parentNode.classList.contains('lang-toggle')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    var n;
    while ((n = w.nextNode())) cb(n);
  }

  function toKhmer() {
    walk(function (n) {
      var key = n.nodeValue.trim();
      if (!MAP[key]) return;
      if (!original.has(n)) original.set(n, n.nodeValue);
      var lead = n.nodeValue.match(/^\s*/)[0];
      var trail = n.nodeValue.match(/\s*$/)[0];
      n.nodeValue = lead + MAP[key] + trail;
    });
    document.documentElement.lang = 'km';
    showingKhmer = true;
  }

  function toEnglish() {
    original.forEach(function (en, n) { n.nodeValue = en; });
    document.documentElement.lang = 'en';
    showingKhmer = false;
  }

  function apply(km2) {
    if (km2) toKhmer(); else toEnglish();
    var b = document.querySelector('.lang-toggle');
    if (b) {
      b.textContent = km2 ? 'EN' : 'ខ្មែរ';
      b.setAttribute('aria-label', km2 ? 'Switch to English' : 'Switch to Khmer');
      b.title = b.getAttribute('aria-label');
    }
  }

  function init() {
    var btn = document.querySelector('.lang-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = !showingKhmer;
        try { localStorage.setItem('pap_lang', next ? 'km' : 'en'); } catch (e) {}
        apply(next);
      });
    }
    var saved = null;
    try { saved = localStorage.getItem('pap_lang'); } catch (e) {}
    if (saved === 'km') apply(true);
    else {
      var b = document.querySelector('.lang-toggle');
      if (b) { b.textContent = 'ខ្មែរ'; b.setAttribute('aria-label', 'Switch to Khmer'); b.title = 'Switch to Khmer'; }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
