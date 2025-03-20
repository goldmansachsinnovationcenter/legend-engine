// Copyright 2025 Goldman Sachs
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package org.finos.legend.engine.protocol.pure.m3.valuespecification;

import org.finos.legend.engine.protocol.pure.m3.type.generics.GenericType;
import org.finos.legend.engine.protocol.pure.m3.valuespecification.raw.ClassInstance;
import org.finos.legend.engine.protocol.pure.m3.multiplicity.Multiplicity;
import org.finos.legend.engine.protocol.pure.m3.valuespecification.constant.PackageableType;
import org.junit.Assert;
import org.junit.Test;

public class VariableToValueSpecificationConverterTest
{
    @Test
    public void testConvertVariableToValueSpecification()
    {
        Variable variable = new Variable();
        variable.name = "testVar";
        variable.genericType = new GenericType(new PackageableType("String"));
        
        ValueSpecification result = VariableToValueSpecificationConverter.convertVariableToValueSpecification(variable);
        
        Assert.assertSame(variable, result);
        Assert.assertTrue(result instanceof Variable);
    }
    
    @Test
    public void testConvertGenericTypeToValueSpecification()
    {
        GenericType genericType = new GenericType(new PackageableType("String"));
        
        ValueSpecification result = VariableToValueSpecificationConverter.convertGenericTypeToValueSpecification(genericType);
        
        Assert.assertTrue(result instanceof ClassInstance);
        ClassInstance classInstance = (ClassInstance) result;
        Assert.assertEquals("classInstance", classInstance._type);
        Assert.assertEquals("String", classInstance.type);
        Assert.assertEquals(1, classInstance.multiplicity.lowerBound.intValue());
        Assert.assertEquals(1, classInstance.multiplicity.upperBound.intValue());
    }
}
