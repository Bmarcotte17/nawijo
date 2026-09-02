// Articles fictifs pour DEMO_MODE=true — permet de tester toute l'interface sans consommer de crédits API.
module.exports = [
  {
    position: 1,
    team: 'Canadien de Montréal',
    sport: 'Hockey',
    title: 'Le Canadien a gagné hier soir !',
    subtitle: 'Une victoire électrisante au Centre Bell',
    badgeEmoji: '🏒',
    teamColor: '#2D4E8A',
    image1: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=1000&q=80',
    image2: 'https://images.unsplash.com/photo-1580891536607-6a23f6d3d1b8?w=1000&q=80',
    content: {
      debutant: {
        '1': { title: 'Le Canadien a gagné hier soir !', body: 'Le Canadien a gagné 4 à 2. Les fans sont contents. Bravo à toute l’équipe !' },
        '2': { title: 'Cole Caufield, la star de la soirée !', body: 'Cole Caufield a compté 2 buts. Il a bien joué. Tout le monde l’applaudit.' }
      },
      intermediaire: {
        '1': { title: 'Le Canadien a gagné hier soir !', body: 'Le Canadien de Montréal a battu les Bruins de Boston 4 à 2 au Centre Bell. Plus de 21 000 partisans ont encouragé l’équipe pendant toute la partie. Les joueurs ont marqué deux buts en première période et deux autres en troisième pour assurer la victoire.' },
        '2': { title: 'Cole Caufield, la star de la soirée !', body: 'Cole Caufield a été le meilleur joueur du match avec deux buts et une passe. À seulement 23 ans, il devient l’un des meilleurs marqueurs de l’équipe cette saison. Après la partie, il a dit qu’il était fier de son équipe et de ses coéquipiers.' }
      },
      expert: {
        '1': { title: 'Le Canadien a gagné hier soir !', body: 'Le Canadien de Montréal a remporté une victoire convaincante de 4 à 2 face aux Bruins de Boston, hier soir au Centre Bell, devant plus de 21 000 spectateurs enthousiastes. L’équipe montréalaise a rapidement pris les devants avec deux buts en première période, avant de conclure la rencontre avec deux autres buts déterminants en troisième période. Cette victoire permet au Canadien de consolider sa position au classement de l’Association Est, dans une saison où chaque point compte pour accéder aux séries éliminatoires. Le gardien de but a également réalisé 28 arrêts, contribuant grandement au succès de l’équipe.' },
        '2': { title: 'Cole Caufield, la star de la soirée !', body: 'L’attaquant Cole Caufield, âgé de 23 ans, a livré une performance exceptionnelle avec deux buts et une passe décisive, méritant sans surprise le titre de première étoile du match. Reconnu pour son tir puissant et précis, Caufield poursuit une saison remarquable et se hisse parmi les meilleurs compteurs de l’équipe. En entrevue après la rencontre, le jeune joueur a souligné l’importance du travail d’équipe : « On a bien exécuté notre plan de match, et mes coéquipiers m’ont donné d’excellentes chances de marquer. » Son entraîneur a également salué sa progression constante depuis le début de la saison.' }
      }
    }
  },
  {
    position: 2,
    team: 'Alouettes de Montréal',
    sport: 'Football',
    title: 'Les Alouettes s’envolent vers la victoire !',
    subtitle: 'Une remontée spectaculaire en deuxième demie',
    badgeEmoji: '🏈',
    teamColor: '#B83A3A',
    image1: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1000&q=80',
    image2: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1000&q=80',
    content: {
      debutant: {
        '1': { title: 'Les Alouettes gagnent le match !', body: 'Les Alouettes ont gagné. Le score était serré. Les joueurs sont fiers.' },
        '2': { title: 'Un joueur devient le héros du match', body: 'Le quart-arrière a très bien joué. Il a aidé son équipe à gagner.' }
      },
      intermediaire: {
        '1': { title: 'Les Alouettes s’envolent vers la victoire !', body: 'Les Alouettes de Montréal ont remporté un match serré 27 à 24 contre les Tiger-Cats de Hamilton. L’équipe tirait de l’arrière par dix points en deuxième demie, mais elle a réussi une belle remontée devant ses partisans au stade Percival-Molson.' },
        '2': { title: 'Un joueur devient le héros du match', body: 'Le quart-arrière des Alouettes a lancé deux passes de touché dans les dix dernières minutes du match. Sa précision et son calme ont permis à l’équipe de revenir de l’arrière. Les partisans ont scandé son nom à la fin de la partie.' }
      },
      expert: {
        '1': { title: 'Les Alouettes s’envolent vers la victoire !', body: 'Dans un match riche en rebondissements disputé au stade Percival-Molson, les Alouettes de Montréal ont créé l’exploit en renversant un déficit de dix points pour l’emporter 27 à 24 face aux Tiger-Cats de Hamilton. Menée 21-11 au début du quatrième quart, la formation montréalaise a orchestré une remontée mémorable grâce à une défense opportuniste et une attaque efficace en fin de match. Cette victoire s’avère cruciale dans la course aux séries éliminatoires de la Ligue canadienne de football, où plusieurs équipes se disputent les dernières places qualificatives.' },
        '2': { title: 'Un joueur devient le héros du match', body: 'Le quart-arrière partant des Alouettes a orchestré une remontée spectaculaire en lançant deux passes de touché au cours des dix dernières minutes de jeu, terminant la rencontre avec 312 verges par la voie aérienne. Son sang-froid sous pression et sa capacité à lire la défense adverse ont fait toute la différence dans les moments critiques du match. « Notre ligne à l’attaque m’a donné tout le temps nécessaire, et mes receveurs ont fait des jeux extraordinaires », a-t-il déclaré après la victoire. Les analystes s’entendent pour dire qu’il s’agit de l’une des meilleures performances de sa carrière.' }
      }
    }
  },
  {
    position: 3,
    team: 'Équipe canadienne de ski',
    sport: 'Ski alpin',
    title: 'Une skieuse québécoise monte sur le podium !',
    subtitle: 'Une médaille remportée en Coupe du monde',
    badgeEmoji: '⛷️',
    teamColor: '#1F8A5F',
    image1: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=1000&q=80',
    image2: 'https://images.unsplash.com/photo-1521699862875-2f0a9a5a1e5b?w=1000&q=80',
    content: {
      debutant: {
        '1': { title: 'Une skieuse gagne une médaille !', body: 'Une skieuse du Québec a fini troisième. Elle est très rapide. Bravo à elle !' },
        '2': { title: 'Une descente pleine de courage', body: 'Elle a skié très vite sur la montagne. Elle n’a pas eu peur. Quelle championne !' }
      },
      intermediaire: {
        '1': { title: 'Une skieuse québécoise monte sur le podium !', body: 'Une skieuse originaire de Québec a terminé troisième lors d’une épreuve de slalom géant en Coupe du monde, disputée en Autriche. C’est sa première médaille de la saison, et elle est très fière de sa performance devant plusieurs athlètes parmi les meilleures au monde.' },
        '2': { title: 'Une descente pleine de courage', body: 'Sur une piste glacée et exigeante, la jeune athlète a réalisé deux descentes presque parfaites. Elle a expliqué qu’elle s’était entraînée très fort tout l’été pour améliorer sa technique dans les virages serrés. Son entraîneur croit qu’elle peut viser l’or aux prochaines compétitions.' }
      },
      expert: {
        '1': { title: 'Une skieuse québécoise monte sur le podium !', body: 'Une skieuse originaire de la région de Québec a savouré une troisième place lors d’une épreuve de slalom géant comptant pour la Coupe du monde de ski alpin, disputée sur les pentes exigeantes de Sölden, en Autriche. Il s’agit de son premier podium de la saison, obtenu face à un plateau relevé comprenant plusieurs des meilleures spécialistes de la discipline. Cette performance confirme la progression constante de l’athlète québécoise, qui évolue sur le circuit international depuis maintenant quatre saisons et vise désormais une place parmi l’élite mondiale.' },
        '2': { title: 'Une descente pleine de courage', body: 'Sur un tracé technique rendu glacé par des températures sous le point de congélation, la skieuse québécoise a livré deux manches remarquablement constantes, négociant avec précision les portes rapprochées du bas du parcours. Elle a confié avoir consacré son été à perfectionner sa technique de virage sur neige artificielle, en collaboration étroite avec son entraîneur personnel. « Chaque détail compte à ce niveau : l’angle des skis, le transfert de poids, la trajectoire », a-t-elle expliqué en entrevue. Son entraîneur se montre optimiste quant à ses chances de monter sur la plus haute marche du podium lors des prochaines étapes de la Coupe du monde.' }
      }
    }
  }
];
