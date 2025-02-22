<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241106163751 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE order_food (order_id INT NOT NULL, food_id INT NOT NULL, PRIMARY KEY(order_id, food_id))');
        $this->addSql('CREATE INDEX IDX_99C913E08D9F6D38 ON order_food (order_id)');
        $this->addSql('CREATE INDEX IDX_99C913E0BA8E87C4 ON order_food (food_id)');
        $this->addSql('ALTER TABLE order_food ADD CONSTRAINT FK_99C913E08D9F6D38 FOREIGN KEY (order_id) REFERENCES "order" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE order_food ADD CONSTRAINT FK_99C913E0BA8E87C4 FOREIGN KEY (food_id) REFERENCES food (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE "order" DROP count');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE order_food DROP CONSTRAINT FK_99C913E08D9F6D38');
        $this->addSql('ALTER TABLE order_food DROP CONSTRAINT FK_99C913E0BA8E87C4');
        $this->addSql('DROP TABLE order_food');
        $this->addSql('ALTER TABLE "order" ADD count INT DEFAULT NULL');
    }
}
