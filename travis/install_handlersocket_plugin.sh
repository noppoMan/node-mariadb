npm install -g mocha

#!/bin/bash
#
# @copyright (c) 2013 phpBB Group
# @license http://opensource.org/licenses/gpl-2.0.php GNU General Public License v2
#
set -e
set -x

# MariaDB Series
VERSION='5.5'

# Operating system codename, e.g. "precise"
OS_CODENAME=$(lsb_release --codename --short)

# Manually purge MySQL to remove conflicting files (e.g. /etc/mysql/my.cnf)
sudo apt-get purge -y mysql-common

if ! which add-apt-repository > /dev/null
then
        sudo apt-get update
        sudo apt-get install -y python-software-properties
fi

MIRROR_DOMAIN='ftp.osuosl.org'
sudo apt-key adv --recv-keys --keyserver keyserver.ubuntu.com 0xcbcb082a1bb943db
sudo add-apt-repository "deb http://$MIRROR_DOMAIN/pub/mariadb/repo/$VERSION/ubuntu $OS_CODENAME main"
sudo apt-get update

# Pin repository in order to avoid conflicts with MySQL from distribution
# repository. See https://mariadb.com/kb/en/installing-mariadb-deb-files
# section "Version Mismatch Between MariaDB and Ubuntu/Debian Repositories"
echo "
Package: *
Pin: origin $MIRROR_DOMAIN
Pin-Priority: 1000
" | sudo tee /etc/apt/preferences.d/mariadb

sudo apt-get install -y mariadb-server

# Set root password to empty string.
echo "
USE mysql;
UPDATE user SET Password = PASSWORD('') where User = 'root';
FLUSH PRIVILEGES;
" | mysql -u root

mysql --version

sudo cp ./travis/hs.cnf /etc/mysql/conf.d/hs.cnf

sudo service mysql restart