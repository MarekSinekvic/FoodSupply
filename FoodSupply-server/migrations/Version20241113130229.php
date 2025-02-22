<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241113130229 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE order_category (order_id INT NOT NULL, category_id INT NOT NULL, PRIMARY KEY(order_id, category_id))');
        $this->addSql('CREATE INDEX IDX_E7B4FB708D9F6D38 ON order_category (order_id)');
        $this->addSql('CREATE INDEX IDX_E7B4FB7012469DE2 ON order_category (category_id)');
        $this->addSql('ALTER TABLE order_category ADD CONSTRAINT FK_E7B4FB708D9F6D38 FOREIGN KEY (order_id) REFERENCES "order" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE order_category ADD CONSTRAINT FK_E7B4FB7012469DE2 FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE order_food DROP CONSTRAINT fk_99c913e08d9f6d38');
        $this->addSql('ALTER TABLE order_food DROP CONSTRAINT fk_99c913e0ba8e87c4');
        $this->addSql('DROP TABLE order_food');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('CREATE TABLE order_food (order_id INT NOT NULL, food_id INT NOT NULL, PRIMARY KEY(order_id, food_id))');
        $this->addSql('CREATE INDEX idx_99c913e0ba8e87c4 ON order_food (food_id)');
        $this->addSql('CREATE INDEX idx_99c913e08d9f6d38 ON order_food (order_id)');
        $this->addSql('ALTER TABLE order_food ADD CONSTRAINT fk_99c913e08d9f6d38 FOREIGN KEY (order_id) REFERENCES "order" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE order_food ADD CONSTRAINT fk_99c913e0ba8e87c4 FOREIGN KEY (food_id) REFERENCES food (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE order_category DROP CONSTRAINT FK_E7B4FB708D9F6D38');
        $this->addSql('ALTER TABLE order_category DROP CONSTRAINT FK_E7B4FB7012469DE2');
        $this->addSql('DROP TABLE order_category');
    }
}
