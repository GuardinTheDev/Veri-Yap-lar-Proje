from faker import Faker
import json
import os


        
class WeightedTransitGraph():
    AutoIntegrityCheck = False

    def __init__(self):
        self.nodeList = []
        self.lineList = []
    
    class TransitLine():

        class TransitLineTypes():
            class BaseLineType(): pass

            class CircularLine(BaseLineType): pass
            class InvalidLine(BaseLineType): pass
            class LinearLine(BaseLineType): pass

        def __init__(self, name: str, parentGraph: WeightedTransitGraph):
            self.lineType = WeightedTransitGraph.TransitLine.TransitLineTypes.LinearLine
            self.name = name
            self.nodeList = [] 
            self.parentGraph = parentGraph
            self.initialNode = None # id=0 is always the initial node
        


        class LineStopNode():
            def __init__(self, parentList, value):
                self.value = value
                self.nextNode = None
                self.id = len(parentList.nodeList)
                self.parentList = parentList
                self.parentList.nodeList.append(self)
                
            def setNextNode(self, nextnode):
                temp = self.nextNode
                self.nextNode = nextnode
                nextnode.nextNode = temp
                
            def getPreviousNode(self):
                for x in self.parentList.nodeList:
                    if x.nextNode == self:
                        return x
                    else:
                        # print("No previous node")
                        return None
        def addNode(node: LineStopNode):
            pass

        def getNodeById(self, id):
            return self.nodeList[id]

        def removeNode(self, targetNode: LineStopNode):
            next = targetNode.nextNode
            prev = targetNode.getPreviousNode()
            if prev is not None:
                prev.setNextNode = next
                self.nodeList.pop(self.getNodeById(targetNode))
        
        def convertLineNodeToTransitNode(self, node):
            pass
        
        def checkIntegrity(self):
            if len(self.nodeList) == 0: 
                print("List empty")
                return
            visitedNodes = []
            def traverse(self):
                iterations = 0
                node = self.nodeList[0]
                while True:
                    visitedNodes.append(node)
                    node = node.nextNode
                    iterations += 1

                    if node == self.nodeList[0]:
                        print("reached initial node")
                        self.lineType = self.__class__.TransitLineTypes.CircularLine()

                    


    class TransitStopNode():
        def __init__(self, name, parentGraph: (WeightedTransitGraph)) -> None:
            self.name = name
            self.parentGraph = parentGraph
            self.id = parentGraph.nodeList.__len__()
            self.connectedNodes = []
            
        def connectNode(self, node, weight, line):
            self.connectedNodes.append((node, weight, line))
            node.connectedNodes.appent((node, weight, line))

    def addNewLine(self, name):
        newLine = self.TransitLine(name, self)
        return newLine
    
    def addNewLine(self, name, stopList):
        newLine = self.TransitLine(name, self)
        stopList[0] = newLine

    def addNode(self, name):
        node = self.TransitStopNode(name, self)
        self.nodeList.append(node)
        return node
    
    def getChildByName(self, name):
        i: WeightedTransitGraph.TransitStopNode
        for i in self.nodeList:
            if i.name == name:
                return(i)
