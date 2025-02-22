<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241104231552 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE food (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, description TEXT DEFAULT NULL, image_privew_uri VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE "order" (id SERIAL NOT NULL, kitchener_id INT DEFAULT NULL, customer_name VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_F5299398725A0439 ON "order" (kitchener_id)');
        $this->addSql('CREATE TABLE order_food (order_id INT NOT NULL, food_id INT NOT NULL, PRIMARY KEY(order_id, food_id))');
        $this->addSql('CREATE INDEX IDX_99C913E08D9F6D38 ON order_food (order_id)');
        $this->addSql('CREATE INDEX IDX_99C913E0BA8E87C4 ON order_food (food_id)');
        $this->addSql('CREATE TABLE "user" (id SERIAL NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL ON "user" (email)');
        $this->addSql('ALTER TABLE "order" ADD CONSTRAINT FK_F5299398725A0439 FOREIGN KEY (kitchener_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE order_food ADD CONSTRAINT FK_99C913E08D9F6D38 FOREIGN KEY (order_id) REFERENCES "order" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE order_food ADD CONSTRAINT FK_99C913E0BA8E87C4 FOREIGN KEY (food_id) REFERENCES food (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE "order" DROP CONSTRAINT FK_F5299398725A0439');
        $this->addSql('ALTER TABLE order_food DROP CONSTRAINT FK_99C913E08D9F6D38');
        $this->addSql('ALTER TABLE order_food DROP CONSTRAINT FK_99C913E0BA8E87C4');
        $this->addSql('DROP TABLE food');
        $this->addSql('DROP TABLE "order"');
        $this->addSql('DROP TABLE order_food');
        $this->addSql('DROP TABLE "user"');
    }
}
