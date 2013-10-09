CREATE TABLE IF NOT EXISTS `node_mariadb_hs_test` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `div` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `div` (`div`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

INSERT INTO `node_mariadb_hs_test` (`id`, `name`, `div`, `created`, `modified`) VALUES
(1, 'Jack', 1, NOW(), NOW()),
(2, 'Tonny', 1, NOW(), NOW());