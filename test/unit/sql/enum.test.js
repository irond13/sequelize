'use strict';

/* jshint -W110 */
var Support   = require(__dirname + '/../support')
  , DataTypes = require(__dirname + '/../../../lib/data-types')
  , expectsql = Support.expectsql
  , current   = Support.sequelize
  , sql       = current.dialect.QueryGenerator;


describe(Support.getTestDialectTeaser('SQL'), function() {
  describe('enum', function () {
    if (Support.getTestDialect() === 'postgres') {
      var FooUser = current.define('user', {
        mood: DataTypes.ENUM('happy', 'sad')
      },{
        schema: 'foo'
      });

      var PublicUser = current.define('user', {
        mood: {
          type: DataTypes.ENUM('happy', 'sad'),
          field: 'theirMood'
        }
      });

      describe('pgEnum', function () {
        it('uses schema #3171', function () {
          expectsql(sql.pgEnum(FooUser.getTableName(), 'mood', FooUser.rawAttributes.mood.type), {
            postgres: 'CREATE TYPE "foo"."enum_users_mood" AS ENUM(\'happy\', \'sad\');'
          });
        });

        it('does not add schema when public', function () {
          expectsql(sql.pgEnum(PublicUser.getTableName(), 'theirMood', PublicUser.rawAttributes.mood.type), {
            postgres: 'CREATE TYPE "enum_users_theirMood" AS ENUM(\'happy\', \'sad\');'
          });
        });
      });

      describe('pgListEnums', function () {
        it('works with schema #3563', function () {
           expectsql(sql.pgListEnums(FooUser.getTableName(), 'mood'), {
            postgres: 'SELECT t.typname enum_name, array_agg(e.enumlabel) enum_value FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = \'foo\' AND t.typname=\'enum_users_mood\' GROUP BY 1'
          });
        });

        it('uses the default schema if options given', function () {
            expectsql(sql.pgListEnums(), {
            postgres: 'SELECT t.typname enum_name, array_agg(e.enumlabel) enum_value FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = \'public\' GROUP BY 1'
          });
        });
      });
    }
  });
});

